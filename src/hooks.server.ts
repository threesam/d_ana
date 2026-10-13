import type { Handle } from '@sveltejs/kit/hooks'

/**
 * All of the site's CSS is written into each page (`inlineStyleThreshold` in vite.config.ts), so
 * nothing has to be fetched before the first paint. SvelteKit 3.0.1 leaves the addresses of the
 * font files in that CSS as they were in the stylesheet file ("./name.woff2") whenever there is
 * no client build, which is this site (csr = false everywhere). From a page those addresses 404
 * and every face falls back. This points them at the folder the files are really in.
 *
 * The site is served from the root, so the folder is written out whole. `tests/smoke.spec.ts`
 * fails if a face does not load. Delete this hook when SvelteKit rewrites them itself.
 */
export const handle: Handle = ({ event, resolve }) =>
	resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace(/<style>[\s\S]*?<\/style>/, (css) =>
				css.replaceAll('url(./', 'url(/_app/immutable/assets/')
			)
	})
