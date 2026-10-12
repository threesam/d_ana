import { error } from '@sveltejs/kit'
import { compose } from '#lib/content/compose.ts'
import { summarize } from '#lib/content/index.ts'
import { frames, intros, piecesOfYear } from '#lib/server/content.ts'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const year = params.year
	const [pieces, rows, written] = await Promise.all([piecesOfYear(year), frames(), intros()])
	if (pieces.length === 0) error(404, 'Nothing here yet')

	const years = summarize(rows)
		.map((y) => y.year)
		.sort((a, b) => a - b)
	const at = years.indexOf(year)
	return {
		year,
		count: pieces.length,
		intro: written.find((w) => w.year === year)?.intro ?? null,
		months: compose(pieces),
		earlier: years[at - 1] ?? null,
		later: years[at + 1] ?? null
	}
}
