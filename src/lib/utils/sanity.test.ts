import { describe, expect, it } from 'vitest'
import { urlFor } from './sanity'

describe('urlFor', () => {
	it('builds a CDN url for the configured project/dataset from an asset ref', () => {
		const url = urlFor('image-abc123-1024x768-jpg').url()
		expect(url).toBe(
			`https://cdn.sanity.io/images/${import.meta.env.VITE_SANITY_PROJECT_ID}/${import.meta.env.VITE_SANITY_DATASET}/abc123-1024x768.jpg`
		)
	})

	it('appends transform params', () => {
		expect(urlFor('image-abc123-1024x768-jpg').width(400).url()).toMatch(/\?w=400$/)
	})

	it('accepts a dereferenced asset (the `asset->` shape the loads return)', () => {
		const asset = { _id: 'image-abc123-1024x768-jpg', url: 'unused', originalFilename: 'x.jpg' }
		expect(urlFor(asset).width(800).auto('format').url()).toMatch(
			/\/abc123-1024x768\.jpg\?w=800&auto=format$/
		)
	})
})
