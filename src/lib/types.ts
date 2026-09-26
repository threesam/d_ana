import type { InputValue } from '@portabletext/svelte'

// Shapes of the GROQ projections in the +*.server.ts loads. Only the fields
// the templates read are declared.

export interface SanityAsset {
	_id: string
	url: string
	originalFilename: string
}

export interface SanityImage {
	asset: SanityAsset
}

export interface Founder {
	name: string
	bio: InputValue
	image: SanityImage
	imageGallery: SanityAsset[]
}

export interface SiteSettings {
	title: string
	description: string
	founder: Founder
}

export interface Post {
	_id: string
	title: string
	slug: { current: string }
	image: SanityImage
	body: InputValue
}
