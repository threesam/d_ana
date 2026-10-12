import { expect, test } from '@playwright/test'

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

test('pages are static: the only script is a few lines of its own', async ({ page }) => {
	await page.goto('/')
	await expect(page.locator('script[src], link[rel="modulepreload"]')).toHaveCount(0)
	// the speculation rules are a hint to the browser in a script tag, not a script
	await expect(page.locator('script:not([type="speculationrules"])')).toHaveCount(1)
})

test('the row of months sticks, follows the page, and a click goes to that month', async ({
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

	// a click on the next name brings that month to the top, and its name into place
	await names.nth(2).locator('a').click()
	await expect.poll(async () => Math.abs(await top(2))).toBeLessThan(1)
	await expect.poll(async () => Math.abs((await left(2)) - column)).toBeLessThan(1)

	// from the list at the top of the page, the last month is far: it still lands exactly
	await page.evaluate(() => {
		scrollTo({ top: 0, behavior: 'instant' })
	})
	await page.locator('nav.months a').last().click()
	const last = (await months.count()) - 1
	await expect.poll(async () => Math.abs(await top(last))).toBeLessThan(1)
	await expect.poll(async () => Math.abs((await left(last)) - column)).toBeLessThan(1)
})

test('the type faces load and nothing the page asks for is missing', async ({ page }) => {
	const missing: string[] = []
	page.on('response', (response) => {
		if (response.status() >= 400) missing.push(response.url())
	})
	await page.goto('/')
	await page.evaluate(() => document.fonts.ready)

	expect(missing).toEqual([])
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
