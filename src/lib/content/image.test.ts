import { describe, expect, it } from 'vitest'
import { card, ladder, sizes, sources } from './image.ts'

const base = `https://cdn.sanity.io/images/${import.meta.env.VITE_SANITY_PROJECT_ID}/${import.meta.env.VITE_SANITY_DATASET}`

describe('ladder', () => {
	it('stops at the width of the photograph and includes it', () => {
		expect(ladder(1080)).toEqual([320, 480, 560, 640, 800, 960, 1080])
		expect(ladder(900)).toEqual([320, 480, 560, 640, 800, 900])
	})

	it('never asks for more than the top of the ladder', () => {
		expect(ladder(4000)).toEqual([320, 480, 560, 640, 800, 960, 1080, 1440, 1920])
	})

	it('gives a tiny photograph its own width only', () => {
		expect(ladder(200)).toEqual([200])
	})

	it('starts lower for a thumbnail, which is drawn far smaller than 320', () => {
		expect(ladder(1080, true).slice(0, 4)).toEqual([160, 240, 320, 480])
		expect(ladder(200, true)).toEqual([160, 200])
	})
})

describe('sources', () => {
	const image = { ref: 'image-abc123-1080x1920-jpg', width: 1080 }

	it('builds CDN urls that let Sanity pick the format and never upscale', () => {
		expect(sources(image).src).toBe(`${base}/abc123-1080x1920.jpg?w=800&q=75&fit=max&auto=format`)
	})

	it('lists every step of the ladder with its width', () => {
		const { srcset } = sources(image)
		expect(srcset.split(', ')).toHaveLength(7)
		expect(srcset).toContain(`${base}/abc123-1080x1920.jpg?w=320&q=75&fit=max&auto=format 320w`)
		expect(srcset.endsWith(' 1080w')).toBe(true)
	})

	it('asks for less quality in the files only a dense screen uses', () => {
		const { srcset } = sources(image)
		expect(srcset).toContain('w=800&q=75&')
		expect(srcset).toContain('w=960&q=60&')
		expect(srcset).toContain('w=1080&q=60&')
	})

	it('offers a thumbnail the small files', () => {
		expect(sources(image, true).srcset).toContain('w=160&q=75&fit=max&auto=format 160w')
	})
})

describe('sizes', () => {
	// a story: 9 wide, 16 tall
	const story = { width: 1080, height: 1920 }

	it('says how wide a photograph is drawn: its columns, or less when its height is capped', () => {
		expect(sizes('bleed', story)).toBe(
			'(min-width: 860px) min(46vw, 600px, 51.8vh), min(77vw, 51.8vh)'
		)
		expect(sizes('first', story)).toBe(
			'(min-width: 860px) min(38vw, 496px, 46.1vh), min(69vw, 46.1vh)'
		)
		expect(sizes('second', story)).toBe(
			'(min-width: 860px) min(30vw, 392px, 46.1vh), min(69vw, 46.1vh)'
		)
	})

	it('lets a wide photograph fill its columns', () => {
		expect(sizes('bleed', { width: 1600, height: 900 })).toBe(
			'(min-width: 860px) min(46vw, 600px, 163.6vh), min(77vw, 163.6vh)'
		)
	})

	it('sizes a thumbnail in the row of four by its fixed height', () => {
		expect(sizes('strip', story)).toBe('(min-width: 1416px) 104px, (min-width: 739px) 7.3vw, 54px')
	})
})

describe('card', () => {
	it('is a JPEG cut from the middle of the photograph to the shape a shared link is drawn in', () => {
		expect(card({ ref: 'image-abc123-2000x1500-jpg', width: 2000, height: 1500 })).toEqual({
			// (`rect` is the cut: the full width, 1050 of the 1500 rows, starting 225 down)
			url: `${base}/abc123-2000x1500.jpg?rect=0,225,2000,1050&w=1200&h=630&fm=jpg&q=80&fit=crop`,
			width: 1200,
			height: 630
		})
	})

	it('never asks for more than the photograph has: a story is 1080 wide', () => {
		expect(card({ ref: 'image-abc123-1080x1920-jpg', width: 1080, height: 1920 })).toMatchObject({
			width: 1080,
			height: 567
		})
	})

	it('keeps the shape when the photograph is too low for its width', () => {
		expect(card({ ref: 'image-abc123-1200x420-jpg', width: 1200, height: 420 })).toMatchObject({
			width: 800,
			height: 420
		})
	})
})
