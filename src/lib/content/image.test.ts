import { describe, expect, it } from 'vitest'
import { ladder, sources } from './image.ts'

const base = `https://cdn.sanity.io/images/${import.meta.env.VITE_SANITY_PROJECT_ID}/${import.meta.env.VITE_SANITY_DATASET}`

describe('ladder', () => {
	it('stops at the width of the photograph and includes it', () => {
		expect(ladder(1080)).toEqual([320, 480, 640, 800, 1080])
		expect(ladder(900)).toEqual([320, 480, 640, 800, 900])
	})

	it('never asks for more than the top of the ladder', () => {
		expect(ladder(4000)).toEqual([320, 480, 640, 800, 1080, 1440, 1920])
	})

	it('gives a tiny photograph its own width only', () => {
		expect(ladder(200)).toEqual([200])
	})
})

describe('sources', () => {
	const image = { ref: 'image-abc123-1080x1920-jpg', width: 1080 }

	it('builds CDN urls that let Sanity pick the format and never upscale', () => {
		expect(sources(image).src).toBe(`${base}/abc123-1080x1920.jpg?w=800&q=75&fit=max&auto=format`)
	})

	it('lists every step of the ladder with its width', () => {
		const { srcset } = sources(image)
		expect(srcset.split(', ')).toHaveLength(5)
		expect(srcset).toContain(`${base}/abc123-1080x1920.jpg?w=320&q=75&fit=max&auto=format 320w`)
		expect(srcset.endsWith(' 1080w')).toBe(true)
	})
})
