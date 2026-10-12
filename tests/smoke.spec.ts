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
