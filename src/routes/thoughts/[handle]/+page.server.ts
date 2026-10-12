import { error } from '@sveltejs/kit'
import type { Post } from '#lib/types.ts'
import { client } from '#lib/utils/sanity.ts'
import type { PageServerLoad } from './$types'

// Prerender every thought the home page links to. 'auto' rather than true so the build
// still passes when the dataset holds no thoughts: the route is then rendered on demand
// (and 404s) instead of failing the build as "marked prerenderable but never reached".
export const prerender = 'auto'

export const load: PageServerLoad = async ({ params }) => {
	const post = await client.fetch<Post | null>(
		`*[_type == 'post' && slug.current == $handle][0]{
		...,
		image{
			...,
			asset->
		}
	}`,
		{
			handle: params.handle
		}
	)

	if (!post) error(404, 'Not found')

	return {
		post
	}
}
