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

test('every photograph holds its place before it loads', async ({ page }) => {
	// no image file ever arrives, so a box can only come from the page itself. A box of nothing
	// at the right edge is never "in view", so the browser never fetches that photograph.
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
})

test('pages are static: no script is shipped', async ({ page }) => {
	await page.goto('/')
	await expect(page.locator('script')).toHaveCount(0)
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
