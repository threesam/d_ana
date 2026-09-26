import { error } from '@sveltejs/kit'
import type { Post } from '$lib/types'
import { client } from '$lib/utils/sanity'
import type { PageServerLoad } from './$types'

// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true

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
