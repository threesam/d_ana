import { building, dev } from '$app/env'
import { summarize } from '#lib/content/index.ts'
import { frames, themes } from '#lib/server/content.ts'
import type { LayoutServerLoad } from './$types'

// Every page is the same for everyone and nothing on it moves, so the whole site is
// written to HTML at build time and ships no JavaScript.
export const prerender = true
export const csr = false

/** Every year and every theme, for the foot of every page: from there no page is a dead end. */
export const load: LayoutServerLoad = async () => {
	// A page that is not there is the one page drawn when it is asked for. It must not ask
	// Sanity for anything (no visitor ever does), so it goes without the lists.
	if (!building && !dev) return { index: { years: [], themes: [] } }
	const [rows, all] = await Promise.all([frames(), themes()])
	return {
		index: {
			years: summarize(rows).map((year) => year.year),
			themes: all.map(({ handle, title }) => ({ handle, title }))
		}
	}
}
