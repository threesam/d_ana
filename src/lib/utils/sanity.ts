import { createClient } from '@sanity/client'
import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'

export const client = createClient({
	projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
	dataset: import.meta.env.VITE_SANITY_DATASET,
	apiVersion: '2021-10-21',
	useCdn: false
})

const builder = createImageUrlBuilder(client)

export const urlFor = (source: SanityImageSource) => {
	return builder.image(source)
}
