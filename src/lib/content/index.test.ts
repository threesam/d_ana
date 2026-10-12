import { describe, expect, it } from 'vitest'
import { dayLabel, monthLabel, summarize } from './index.ts'
import type { Image } from './types.ts'

const image = (key: string): Image => ({
	key,
	ref: `image-${key}-1080x1920-jpg`,
	alt: key,
	width: 1080,
	height: 1920,
	tone: null
})
const row = (day: string, key: string) => ({ day, image: image(key) })

describe('summarize', () => {
	it('counts pieces per year, newest year first', () => {
		const years = summarize([
			row('2018-01-01', 'a'),
			row('2019-05-01', 'b'),
			row('2019-06-01', 'c')
		])
		expect(years.map((y) => [y.year, y.count])).toEqual([
			[2019, 2],
			[2018, 1]
		])
	})

	it('picks four photographs spread across a year, in order', () => {
		const rows = Array.from({ length: 9 }, (_, i) =>
			row(`2020-0${String(i + 1)}-01`, `k${String(i)}`)
		)
		const [year] = summarize(rows)
		expect(year?.frames.map((f) => f.key)).toEqual(['k0', 'k2', 'k4', 'k6'])
	})

	it('shows every photograph when a year has four or fewer', () => {
		const [year] = summarize([row('2016-12-26', 'a'), row('2016-12-28', 'b')])
		expect(year?.frames.map((f) => f.key)).toEqual(['a', 'b'])
	})
})

describe('labels', () => {
	it('writes a day the way a caption reads', () => {
		expect(dayLabel('2024-03-14')).toBe('14 Mar')
	})

	it('names a month, with its year when asked', () => {
		expect(monthLabel('2019-03')).toBe('March')
		expect(monthLabel('2019-03', true)).toBe('March 2019')
	})
})
