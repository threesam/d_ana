import type { Post } from '$lib/types'
import { client } from '$lib/utils/sanity'
import type { PageServerLoad } from './$types'

// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true

export const load: PageServerLoad = async () => {
	const posts = await client.fetch<Post[]>(`*[_type == 'post']{
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
