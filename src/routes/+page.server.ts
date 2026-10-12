import type { Post } from '#lib/types.ts'
import { client } from '#lib/utils/sanity.ts'
import type { PageServerLoad } from './$types'

// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true

export const load: PageServerLoad = async () => {
	const posts = await client.fetch<Post[]>(`*[_type == 'post' && defined(slug.current)]{
		...,
		image{
			...,
			asset->
		}
	}`)

	return {
		posts
	}
}
