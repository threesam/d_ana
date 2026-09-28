import type { InputValue } from '@portabletext/svelte'

// Shapes of the GROQ projections in the +*.server.ts loads. Only the fields
// the templates read are declared.

export interface SanityAsset {
	_id: string
	url: string
	metadata: { dimensions: { width: number; height: number } }
}

// A gallery item: the dereferenced asset spread in, plus the image's own alt.
export interface GalleryImage extends SanityAsset {
	alt?: string | undefined
}

export interface SanityImage {
	asset: SanityAsset
}

export interface Founder {
	name: string
	bio: InputValue
	image: SanityImage
	imageGallery: GalleryImage[]
}

export interface SiteSettings {
	title: string
	description: string
	founder: Founder
}

export interface Post {
	_id: string
	title: string
	description?: string | null | undefined
	slug: { current: string }
	image: SanityImage
	body: InputValue
}
