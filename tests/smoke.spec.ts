import { expect, test } from '@playwright/test'

test('home renders the bio and links to a thought', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByRole('heading', { level: 1 })).toContainText("I'm")
	await expect(page.getByRole('heading', { name: 'Thoughts' })).toBeVisible()

	await page.getByRole('link', { name: 'read more' }).first().click()
	await expect(page).toHaveURL(/\/thoughts\//)
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
