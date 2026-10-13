import { error } from '@sveltejs/kit'
import { compose } from '#lib/content/compose.ts'
import { theme } from '#lib/server/content.ts'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const found = await theme(params.handle)
	if (found === null || found.count === 0) error(404, 'Nothing here yet')
	const { pieces, ...rest } = found
	return {
		theme: rest,
		months: compose(pieces),
		// the theme's first photograph is what a shared link to it shows
		cover: pieces.find((piece) => piece.images.length > 0)?.images[0] ?? null
	}
}
