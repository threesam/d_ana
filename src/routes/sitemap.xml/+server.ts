import { SITE, summarize } from '#lib/content/index.ts'
import { frames, themes } from '#lib/server/content.ts'
import type { RequestHandler } from './$types'

export const prerender = true

/** Every page of the site, for search engines: home, each year, each theme, the map. */
export const GET: RequestHandler = async () => {
	const [rows, all] = await Promise.all([frames(), themes()])
	const paths = [
		'/',
		...summarize(rows).map((year) => `/${String(year.year)}`),
		...all.map((theme) => `/theme/${theme.handle}`),
		'/places'
	]
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `<url><loc>${SITE}${path}</loc></url>`).join('\n')}
</urlset>
`
	return new Response(body, { headers: { 'content-type': 'application/xml' } })
}
