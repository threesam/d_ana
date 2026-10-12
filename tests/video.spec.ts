import { expect, test, type Locator, type Page } from '@playwright/test'

// These run in the Google Chrome installed on this machine, not the browser bundled with
// Playwright: the bundled one cannot decode the videos (H.264), so in it nothing ever plays.
test.use({ channel: 'chrome' })

/** The first year page that holds a video. */
async function openYearWithVideo(page: Page) {
	await page.goto('/')
	const years = await page
		.locator('a.year')
		.evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))
	for (const year of years) {
		await page.goto(year)
		if ((await page.locator('main video').count()) > 0) return
	}
	throw new Error('no year page holds a video')
}

const paused = (video: Locator) => video.evaluate((v: HTMLVideoElement) => v.paused)

/**
 * Bring a video on screen the way a reader gets there. A month far down the page is not drawn
 * until it is near the screen, and a jump straight to something inside it lands in the wrong
 * place, so go to the month first and then to the video.
 */
async function reach(video: Locator) {
	await video.evaluate((v) => v.closest('section')?.scrollIntoView())
	await video.scrollIntoViewIfNeeded()
}

test('a video plays while it is on screen and stops when it leaves', async ({ page }) => {
	const fetched: string[] = []
	page.on('request', (request) => {
		if (request.url().endsWith('.mp4')) fetched.push(request.url())
	})
	await openYearWithVideo(page)
	const video = page.locator('main video').first()

	// nothing is downloaded for a video nobody has reached
	expect(fetched).toHaveLength(0)
	expect(await paused(video)).toBe(true)

	await reach(video)
	await expect.poll(() => paused(video)).toBe(false)
	expect(fetched.length).toBeGreaterThan(0)
	// it is really moving, not only marked as playing
	await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0)

	// a click stops it, and it stays stopped while it is still on screen
	await video.click()
	expect(await paused(video)).toBe(true)
	await page.waitForTimeout(600)
	expect(await paused(video)).toBe(true)
	await video.click()
	expect(await paused(video)).toBe(false)

	await page.evaluate(() => {
		scrollTo(0, 0)
	})
	await expect.poll(() => paused(video)).toBe(true)
})

test('someone who asked for less motion starts a video themselves', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' })
	await openYearWithVideo(page)
	const video = page.locator('main video').first()

	await reach(video)
	await page.waitForTimeout(600)
	expect(await paused(video)).toBe(true)

	await video.focus()
	await page.keyboard.press('Enter')
	expect(await paused(video)).toBe(false)
})
