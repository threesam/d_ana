import type { SiteSettings } from '$lib/types'
import { client } from '$lib/utils/sanity'
import type { LayoutServerLoad } from './$types'

// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true

export const load: LayoutServerLoad = async () => {
	const settings = await client.fetch<SiteSettings>(`*[_type == 'siteSettings'][0]{
		...,
		image{
			...,
			asset->
		},
		icons[]{
			asset->
		},
		founder->{
			...,
			image{
				...,
				asset->
			},
			imageGallery[]{
				...
				asset->
			},
		}
	}`)

	return {
		settings
	}
}
