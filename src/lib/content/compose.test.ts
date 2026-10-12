import { describe, expect, it } from 'vitest'
import { compose, type Block } from './compose.ts'
import type { Image, Piece } from './types.ts'

const image = (key: string): Image => ({
	key,
	ref: `image-${key}-1080x1920-jpg`,
	alt: key,
	width: 1080,
	height: 1920,
	tone: null
})

const piece = (handle: string, day: string, images: number, text: string | null = null): Piece => ({
	handle,
	kind: 'story',
	day,
	title: null,
	text,
	images: Array.from({ length: images }, (_, i) => image(`${handle}-${String(i)}`)),
	place: null,
	people: [],
	themes: []
})

const layouts = (blocks: Block[]) => blocks.map((b) => b.layout)

describe('compose', () => {
	it('groups pieces into months, in order', () => {
		const months = compose([
			piece('a', '2019-01-03', 1),
			piece('b', '2019-01-20', 1),
			piece('c', '2019-03-02', 1)
		])
		expect(months.map((m) => m.month)).toEqual(['2019-01', '2019-03'])
	})

	it('sets one photograph as a bleed', () => {
		const [month] = compose([piece('a', '2019-01-03', 1)])
		expect(layouts(month?.blocks ?? [])).toEqual(['bleed'])
	})

	it('pairs photographs and never leaves one hanging before a pair', () => {
		const run = (n: number) =>
			layouts(
				compose(Array.from({ length: n }, (_, i) => piece(`p${String(i)}`, '2019-01-03', 1)))[0]
					?.blocks ?? []
			)
		expect(run(2)).toEqual(['stagger'])
		expect(run(3)).toEqual(['stagger', 'bleed'])
		expect(run(4)).toEqual(['stagger', 'stagger'])
		expect(run(5)).toEqual(['stagger', 'bleed', 'stagger'])
		expect(run(8)).toEqual(['stagger', 'bleed', 'stagger', 'bleed', 'stagger'])
	})

	it('never sets three bleeds in a row', () => {
		const months = compose(
			Array.from({ length: 40 }, (_, i) => piece(`p${String(i)}`, '2019-01-03', 1))
		)
		const seq = layouts(months[0]?.blocks ?? []).join(' ')
		expect(seq).not.toContain('bleed bleed')
	})

	it('flips the side each time a layout repeats, across months', () => {
		const months = compose([
			piece('a', '2019-01-03', 1),
			piece('b', '2019-02-03', 1),
			piece('c', '2019-03-03', 1)
		])
		const sides = months.flatMap((m) => m.blocks).map((b) => (b.layout === 'bleed' ? b.side : null))
		expect(sides).toEqual(['right', 'left', 'right'])
	})

	it('keeps the text with the first photograph of a piece only', () => {
		const [month] = compose([piece('a', '2019-01-03', 2, 'hello')])
		const block = month?.blocks[0]
		expect(block?.layout).toBe('stagger')
		if (block?.layout !== 'stagger') return
		expect(block.a.lead).toBe(true)
		expect(block.b.lead).toBe(false)
	})

	it('sets writing with no photograph as a title page, after what came before it', () => {
		const [month] = compose([
			piece('a', '2019-01-03', 1),
			piece('essay', '2019-01-04', 0, 'words'),
			piece('b', '2019-01-05', 1)
		])
		expect(layouts(month?.blocks ?? [])).toEqual(['bleed', 'title', 'bleed'])
	})

	it('drops a piece with neither photograph nor words', () => {
		expect(compose([piece('empty', '2019-01-03', 0)])).toEqual([])
	})
})
