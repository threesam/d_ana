import { summarize } from '#lib/content/index.ts'
import { frames, intros, themes } from '#lib/server/content.ts'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const [rows, written, allThemes] = await Promise.all([frames(), intros(), themes()])
	const intro = new Map(written.map((w) => [w.year, w.intro]))
	return {
		years: summarize(rows).map((y) => ({ ...y, intro: intro.get(y.year) ?? null })),
		themes: allThemes
	}
}
