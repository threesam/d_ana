import { expect, test } from '@playwright/test'

declare global {
	interface Window {
		/** every place the page has scrolled through (the months test tells a glide from a cut by it) */
		trail: number[]
	}
}

test('home lists the years and a year shows described photographs', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByRole('heading', { level: 1, name: 'd-ana' })).toBeVisible()

	await page.locator('a.year').first().click()
	await expect(page).toHaveURL(/\/\d{4}$/)
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^\d{4}$/)

	const photographs = page.locator('main img')
	expect(await photographs.count()).toBeGreaterThan(0)
	await expect(page.locator('main img:not([alt]), main img[alt=""]')).toHaveCount(0)
})

test('the foot of every page says where else she is', async ({ page }) => {
	for (const path of ['/', '/places']) {
		await page.goto(path)
		const elsewhere = page.locator('footer nav[aria-label="Elsewhere"] a')
		await expect(elsewhere).toHaveCount(2)
		await expect(elsewhere.nth(0)).toHaveAttribute('href', 'https://www.instagram.com/__d_ana___')
		await expect(elsewhere.nth(1)).toHaveAttribute('href', 'https://tiktok.com/@d_ana___')
	}
})

test('on the home page a year is grey until it is pointed at or reached with Tab', async ({
	page
}) => {
	await page.goto('/')
	const first = page.locator('a.year').first().locator('.strip')
	const second = page.locator('a.year').nth(1).locator('.strip')
	await expect(first).toHaveCSS('filter', 'grayscale(1)')
	await page.locator('a.year').first().hover()
	await expect(first).toHaveCSS('filter', 'none')
	await expect(second).toHaveCSS('filter', 'grayscale(1)')
	// the pointer goes away, and the keyboard reaches the second year
	await page.mouse.move(0, 0)
	await expect(first).toHaveCSS('filter', 'grayscale(1)')
	await page.locator('a.year').nth(1).focus()
	await page.keyboard.press('Shift+Tab')
	await page.keyboard.press('Tab')
	await expect(second).toHaveCSS('filter', 'none')
})

test('every photograph holds its place before it loads, and none is cut', async ({ page }) => {
	// no image file ever arrives, so a box can only come from the page itself. A box of nothing
	// at the right edge is never "in view", so the browser never fetches that photograph.
	// wider than the column, so there is a margin for a photograph to run into
	await page.setViewportSize({ width: 1600, height: 900 })
	await page.route('**/cdn.sanity.io/**', (route) => route.abort())
	await page.goto('/')
	await page.locator('a.year').first().click()
	await expect(page).toHaveURL(/\/\d{4}$/)

	const empty = await page.locator('main img').evaluateAll(
		(images) =>
			images.filter((image) => {
				const box = image.getBoundingClientRect()
				return box.width < 2 || box.height < 2
			}).length
	)
	expect(empty).toBe(0)

	// a photograph set to run off the edge must not be cut at the column: its outer edge is still it
	const cut = await page.locator('main .bleed .photo').evaluateAll(
		(photos) =>
			photos.slice(0, 6).filter((photo) => {
				photo.scrollIntoView({ block: 'center', behavior: 'instant' })
				const box = photo.getBoundingClientRect()
				const outer = box.left < innerWidth - box.right ? box.left + 3 : box.right - 3
				return !photo.contains(document.elementFromPoint(outer, innerHeight / 2))
			}).length
	)
	expect(cut).toBe(0)
})

test('pages are static: as served, the only script is a few lines of its own', async ({
	page,
	request
}) => {
	// what the server sends asks for no script file and no framework code
	const served = await (await request.get('/')).text()
	expect(served).not.toMatch(/<script[^>]*\ssrc=|rel="modulepreload"/)

	await page.goto('/')
	await expect(page.locator('link[rel="modulepreload"]')).toHaveCount(0)
	// the speculation rules are a hint to the browser in a script tag, not a script
	await expect(page.locator('script:not([type="speculationrules"]):not([src])')).toHaveCount(1)
	// the one script file is the visitor count, which that script adds once the page has loaded
	// (tests/analytics.spec.ts holds it to its terms)
	await expect(page.locator('script[src]')).toHaveCount(1)
})

test('the row of months sticks, follows the page, and a click glides to that month', async ({
	page
}) => {
	await page.setViewportSize({ width: 1280, height: 800 })
	await page.goto('/')
	await page.locator('a.year').first().click()
	const names = page.locator('.ribbon li')
	const months = page.locator('.run section')
	expect(await names.count()).toBeGreaterThan(2)

	const left = (n: number) => names.nth(n).evaluate((name) => name.getBoundingClientRect().left)
	const top = (n: number) => months.nth(n).evaluate((month) => month.getBoundingClientRect().top)
	// at rest the first name stands exactly over the first month's heading
	const column = await months
		.first()
		.locator('h2')
		.evaluate((heading) => heading.getBoundingClientRect().left)
	expect(Math.abs((await left(0)) - column)).toBeLessThan(1)
	await expect(page.locator('.run')).not.toHaveClass(/stuck/)

	// at the second month, its name stands where the first one stood
	await months.nth(1).evaluate((month) => {
		month.scrollIntoView({ behavior: 'instant' })
	})
	await expect.poll(async () => Math.abs((await left(1)) - column)).toBeLessThan(1)
	await expect(page.locator('.run')).toHaveClass(/stuck/)

	// From here on, keep every place the page scrolls through. `passed` waits for the page to
	// settle, then hands them over and starts again.
	await page.evaluate(() => {
		window.trail = []
		addEventListener('scroll', () => window.trail.push(scrollY))
	})
	const passed = () =>
		page.evaluate(async () => {
			await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))
			const trail = window.trail.splice(0)
			return { places: trail.length, first: trail[0] ?? NaN, at: scrollY }
		})

	// A click on a name six screens off (a month away, as months go) glides there: the page sets
	// off from where it was, passes through the way, and the month and its name arrive together.
	await months.nth(2).evaluate((month) => {
		scrollBy({ top: month.getBoundingClientRect().top - 6 * innerHeight, behavior: 'instant' })
	})
	const { at: start } = await passed()
	await names.nth(2).locator('a').click()
	await expect.poll(async () => Math.abs(await top(2))).toBeLessThan(1)
	await expect.poll(async () => Math.abs((await left(2)) - column)).toBeLessThan(1)
	const glide = await passed()
	expect(glide.places).toBeGreaterThan(3)
	expect(glide.first - start).toBeLessThan(400)

	// From the list at the top of the page the last month is many screens off. The page cuts to
	// one screen short of it and glides the rest, the row slides there by itself, and both
	// land exactly.
	await page.evaluate(() => {
		scrollTo({ top: 0, behavior: 'instant' })
	})
	const last = (await months.count()) - 1
	expect(await top(last)).toBeGreaterThan(12 * 800)
	await passed()
	await page.locator('nav.months a').last().click()
	await expect.poll(async () => Math.abs(await top(last))).toBeLessThan(1)
	await expect.poll(async () => Math.abs((await left(last)) - column)).toBeLessThan(1)
	const hop = await passed()
	expect(hop.places).toBeGreaterThan(3)
	expect(hop.at - hop.first).toBeLessThanOrEqual(801)
	// and then the row follows the page again
	await months.nth(1).evaluate((month) => {
		month.scrollIntoView({ behavior: 'instant' })
	})
	await expect.poll(async () => Math.abs((await left(1)) - column)).toBeLessThan(1)
})

test('a month that has gone by comes back with a swipe along the row', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 })
	await page.goto('/')
	await page.locator('a.year').first().click()
	const months = page.locator('.run section')
	const names = page.locator('.ribbon li a')
	const column = await months
		.first()
		.locator('h2')
		.evaluate((heading) => heading.getBoundingClientRect().left)
	// how far a name stands from the left of the column, and how solid it is drawn
	const off = async (name: typeof names) =>
		Math.abs((await name.evaluate((a) => a.getBoundingClientRect().left)) - column)
	const solid = (name: typeof names) => name.evaluate((a) => getComputedStyle(a).opacity)

	// at the last month, the first month's name has gone off to the left
	await months.last().evaluate((month) => {
		month.scrollIntoView({ behavior: 'instant' })
	})
	await expect.poll(() => off(names.last())).toBeLessThan(1)
	await expect.poll(() => solid(names.first())).toBe('0')

	// a swipe along the row (two fingers on a trackpad here, one on a phone) brings it back
	await page.locator('.ribbon').hover()
	await page.mouse.wheel(-9000, 0)
	await expect.poll(() => off(names.first())).toBeLessThan(1)
	await expect.poll(() => solid(names.first())).toBe('1')

	// read on, and the row goes back to the month the page is in
	await expect
		.poll(async () => {
			await page.mouse.wheel(0, 20)
			return off(names.last())
		})
		.toBeLessThan(1)

	// swipe back again and click the first name: the page goes to that month
	await page.mouse.wheel(-9000, 0)
	await expect.poll(() => solid(names.first())).toBe('1')
	await names.first().click()
	await expect
		.poll(() => months.first().evaluate((month) => Math.abs(month.getBoundingClientRect().top)))
		.toBeLessThan(1)
	await expect.poll(() => off(names.first())).toBeLessThan(1)
})

test('the type faces load and nothing the page asks for is missing', async ({ page }) => {
	const missing: string[] = []
	const faces: string[] = []
	page.on('response', (response) => {
		if (response.status() >= 400) missing.push(response.url())
	})
	page.on('request', (request) => {
		if (request.resourceType() === 'font') faces.push(request.url())
	})
	await page.goto('/')
	await page.evaluate(() => document.fonts.ready)

	expect(missing).toEqual([])
	// The faces a first screen uses are written into the page (vite.config.ts), and nothing on
	// the home page that needs another face is drawn before a reader nears it: no face is fetched.
	expect(faces).toEqual([])
	const loaded = await page.evaluate(() =>
		[...document.fonts].filter((face) => face.status === 'loaded').map((face) => face.family)
	)
	expect(loaded.some((family) => family.includes('Poiret One'))).toBe(true)
	expect(loaded.some((family) => family.includes('Spectral'))).toBe(true)
})

test('the skip link moves focus into the page', async ({ page }) => {
	await page.goto('/')
	await page.keyboard.press('Tab')
	await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
	await page.keyboard.press('Enter')
	await expect(page.locator('#main')).toBeFocused()
})

test('an old address is a 404, not a blank page', async ({ page }) => {
	const response = await page.goto('/thoughts/anything')
	expect(response?.status()).toBe(404)
	await expect(page.getByRole('link', { name: 'Back to the years' })).toBeVisible()
})
