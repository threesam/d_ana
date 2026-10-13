import { expect, test, type Page } from '@playwright/test'

const SITE = 'https://d-ana.com'
const hrefs = (links: Element[]) => links.map((link) => link.getAttribute('href') ?? '')

/** Every year and every theme, as the home page lists them. */
async function index(page: Page) {
	await page.goto('/')
	const years = await page.locator('a.year').evaluateAll(hrefs)
	const themes = await page.locator('section.themes a').evaluateAll(hrefs)
	expect(years.length).toBeGreaterThan(3)
	expect(themes.length).toBeGreaterThan(1)
	return { years, themes, year: years[2] ?? '', theme: themes[0] ?? '' }
}

test('from the foot of any page a reader can go to any year and any theme', async ({ page }) => {
	const { years, themes, year, theme } = await index(page)
	for (const path of ['/places', theme, year]) {
		await page.goto(path)
		expect(await page.locator('footer nav[aria-label="All years"] a').evaluateAll(hrefs)).toEqual(
			years
		)
		expect(await page.locator('footer nav[aria-label="All themes"] a').evaluateAll(hrefs)).toEqual(
			themes
		)
	}
	// the year a reader is in is marked as where they are
	await expect(page.locator('footer a[aria-current="page"]')).toHaveAttribute('href', year)
	await page.locator('footer nav[aria-label="All years"] a').last().click()
	await expect(page).toHaveURL(new RegExp(`${years.at(-1) ?? ''}$`))
})

test('the masthead leads to the themes, and a year opens with the years beside it', async ({
	page
}) => {
	const { years, year } = await index(page)
	await page.goto('/places')
	const site = page.getByRole('navigation', { name: 'Site' })
	await site.getByRole('link', { name: 'Themes' }).click()
	await expect(page).toHaveURL(/\/#themes$/)
	await expect(page.getByRole('heading', { name: 'Themes' })).toBeInViewport()

	// a year in the middle: the year before it and the year after are on its first screen
	await page.goto(year)
	const beside = page.getByRole('navigation', { name: 'The years beside this one' })
	await expect(beside).toBeInViewport()
	expect(await beside.getByRole('link').evaluateAll(hrefs)).toEqual([years[3], years[1]])
	await beside.getByRole('link').first().click()
	await expect(page).toHaveURL(new RegExp(`${years[3] ?? ''}$`))
})

test('every link in a menu is big enough for a thumb', async ({ page }) => {
	const { year, theme } = await index(page)
	await page.setViewportSize({ width: 390, height: 844 })
	for (const path of ['/', year, theme, '/places']) {
		await page.goto(path)
		// (the foot is not drawn until a reader nears it: have it drawn, so its links have a size)
		await page.locator('footer').evaluate((foot) => {
			foot.style.contentVisibility = 'visible'
		})
		// 24 by 24 CSS pixels is the least a target may be (WCAG 2.2, 2.5.8)
		const small = await page.locator('nav a').evaluateAll((links) =>
			links
				.filter((link) => {
					const box = link.getBoundingClientRect()
					return link.checkVisibility() && (box.width < 24 || box.height < 24)
				})
				.map((link) => link.textContent)
		)
		expect(small, path).toEqual([])
	}
})

test('a shared link says what the page is and shows one of its photographs', async ({ page }) => {
	const { year, theme } = await index(page)
	for (const path of ['/', year, theme, '/places']) {
		await page.goto(path)
		const said = (name: string) => page.locator(`head meta[property="og:${name}"]`)
		await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', SITE + path)
		await expect(said('url')).toHaveAttribute('content', SITE + path)
		await expect(said('title')).toHaveAttribute('content', await page.title())
		await expect(said('description')).toHaveAttribute('content', /\w{3}/)
		// a JPEG at the size a card is drawn, whatever shape the photograph is
		await expect(said('image')).toHaveAttribute(
			'content',
			/^https:\/\/cdn\.sanity\.io\/images\/.+[?&]fm=jpg/
		)
		await expect(said('image:alt')).toHaveAttribute('content', /\w{3}/)
		await expect(page.locator('head meta[name="twitter:card"]')).toHaveAttribute(
			'content',
			'summary_large_image'
		)
	}
})

test('the sitemap lists every page, and robots.txt says where it is', async ({ page, request }) => {
	const { years, themes } = await index(page)
	const sitemap = await (await request.get('/sitemap.xml')).text()
	for (const path of ['/', ...years, ...themes, '/places'])
		expect(sitemap).toContain(`<loc>${SITE}${path}</loc>`)
	expect(await (await request.get('/robots.txt')).text()).toContain(`Sitemap: ${SITE}/sitemap.xml`)
})
