import { client } from '$lib/utils/sanity'
// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true

export async function load() {
	const posts = await client.fetch(`*[_type == 'post']{
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
