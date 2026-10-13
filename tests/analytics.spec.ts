import { expect, test, type Page } from '@playwright/test'

type Said = [name: string, data: Record<string, string> | undefined]

declare global {
	interface Window {
		/** the tracker's own name in the page (umami puts itself here once it has loaded) */
		umami?: { track: (name: string, data?: Record<string, string>) => void }
		/** hands what the page tells the tracker over to the test */
		heard: (name: string, data?: Record<string, string>) => Promise<void>
	}
}

const HOST = 'https://analytics.sixtom.com'

/**
 * Stand in for the tracker and keep everything the page tells it, across every page of a visit.
 * The real one is never fetched: these tests must not lean on Sam's server, or count there.
 */
async function listen(page: Page) {
	const said: Said[] = []
	await page.route(`${HOST}/**`, (route) => route.abort())
	await page.exposeFunction('heard', (name: string, data?: Record<string, string>) => {
		said.push([name, data])
	})
	await page.addInitScript(() => {
		window.umami = {
			track: (name, data) => {
				void window.heard(name, data)
			}
		}
	})
	return said
}

test('the tracker is fetched once the page is up, and counts only on the real site', async ({
	page,
	request
}) => {
	// as served, a page asks for no script file: the tracker never stands between a reader and it
	const served = await (await request.get('/')).text()
	expect(served).not.toMatch(/<script[^>]*\ssrc=/)

	await page.route(`${HOST}/**`, (route) => route.abort())
	await page.goto('/')
	const tracker = page.locator('script[src]')
	await expect(tracker).toHaveCount(1)
	await expect(tracker).toHaveAttribute('src', `${HOST}/script.js`)
	await expect(tracker).toHaveAttribute('data-website-id', /^[0-9a-f-]{36}$/)
	// off d-ana.com (a preview, a laptop) the tracker says nothing
	await expect(tracker).toHaveAttribute('data-domains', 'd-ana.com')
	// and it reports how fast each page drew
	await expect(tracker).toHaveAttribute('data-performance', 'true')
})

test('a visit is counted: where the reader goes, what they read, and a follow', async ({
	page
}) => {
	const said = await listen(page)
	await page.goto('/')
	const year = page.locator('a.year').first()
	const path = (await year.getAttribute('href')) ?? ''
	await year.click()
	await expect(page).toHaveURL(/\/\d{4}$/)
	expect(said).toContainEqual(['year', { to: path, via: 'years' }])

	// to the last month, from the list at the top of the year
	const months = page.locator('nav.months a')
	expect(await months.count()).toBeGreaterThan(3)
	const last = (await months.last().getAttribute('href')) ?? ''
	const passed = (await months.nth(2).getAttribute('href')) ?? ''
	await months.last().click()
	expect(said).toContainEqual(['month', { to: path + last, via: 'list' }])
	// a month is read once it has stayed on screen, not when the page goes by it
	await expect.poll(() => said, { timeout: 8000 }).toContainEqual(['read', { id: last.slice(1) }])
	expect(said).not.toContainEqual(['read', { id: passed.slice(1) }])

	// her own accounts, at the foot of the page: the one thing a reader can do about her
	// (the click is counted and goes nowhere: this test does not visit Instagram)
	await page.evaluate(() => {
		addEventListener(
			'click',
			(e) => {
				e.preventDefault()
			},
			{ capture: true, once: true }
		)
	})
	await page.locator('footer nav[aria-label="Elsewhere"] a').first().click()
	expect(said).toContainEqual(['follow', { to: 'instagram.com/__d_ana___', via: 'foot' }])
	// and having stayed at the foot, the reader has reached the end of the page
	await expect.poll(() => said, { timeout: 8000 }).toContainEqual(['end', undefined])
})

test('an address that is not there is counted as one', async ({ page }) => {
	const said = await listen(page)
	await page.goto('/thoughts/anything')
	await expect.poll(() => said, { timeout: 8000 }).toContainEqual(['404', undefined])
})

test('?test takes a browser out of the count for good, and ?test=0 puts it back', async ({
	page
}) => {
	await page.route(`${HOST}/**`, (route) => route.abort())
	// umami's own switch: the tracker reads it before everything it sends
	const out = () => page.evaluate(() => localStorage.getItem('umami.disabled'))
	await page.goto('/')
	expect(await out()).toBeNull()
	await page.goto('/?test')
	expect(await out()).toBe('1')
	await page.goto('/places')
	expect(await out()).toBe('1')
	await page.goto('/?test=0')
	expect(await out()).toBeNull()
})
