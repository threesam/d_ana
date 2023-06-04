import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
	projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
	dataset: import.meta.env.VITE_SANITY_DATASET,
	apiVersion: '2021-10-21',
	useCdn: false
})

const builder = imageUrlBuilder(client)

export const urlFor = (source: string) => {
	return builder.image(source)
}
