import { describe, expect, it } from 'vitest'
import { plot } from './places.ts'

const frame = { width: 1000, height: 500, pad: 40 }
const spot = (city: string, lat: number, lng: number) => ({ city, lat, lng })

describe('plot', () => {
	it('draws nothing when there are no places', () => {
		expect(plot([], frame)).toEqual([])
	})

	it('centres a single place', () => {
		const [dot] = plot([spot('Reykjavik', 64.15, -21.94)], frame)
		expect(dot).toMatchObject({ x: 500, y: 250, count: 1, city: 'Reykjavik' })
	})

	it('keeps west on the left and north at the top, inside the frame', () => {
		const dots = plot([spot('Austin', 30.27, -97.74), spot('Budapest', 47.5, 19.04)], frame)
		const austin = dots.find((d) => d.city === 'Austin')
		const budapest = dots.find((d) => d.city === 'Budapest')
		expect(austin?.x).toBeLessThan(budapest?.x ?? 0)
		expect(budapest?.y).toBeLessThan(austin?.y ?? 0)
		for (const d of dots) {
			expect(d.x).toBeGreaterThanOrEqual(frame.pad)
			expect(d.x).toBeLessThanOrEqual(frame.width - frame.pad)
			expect(d.y).toBeGreaterThanOrEqual(frame.pad)
			expect(d.y).toBeLessThanOrEqual(frame.height - frame.pad)
		}
	})

	it('folds pieces made in one city into one bigger dot', () => {
		const dots = plot(
			[spot('Austin', 30.27, -97.74), spot('Austin', 30.25, -97.75), spot('Budapest', 47.5, 19.04)],
			frame
		)
		expect(dots).toHaveLength(2)
		const austin = dots.find((d) => d.city === 'Austin')
		const budapest = dots.find((d) => d.city === 'Budapest')
		expect(austin?.count).toBe(2)
		expect(austin?.r).toBeGreaterThan(budapest?.r ?? Infinity)
	})

	it('groups nameless places by where they are', () => {
		const dots = plot(
			[spot('', 44.01, -110.02), spot('', 44.03, -110.04), spot('', 36.1, -112.1)],
			frame
		)
		expect(dots.map((d) => d.count).sort()).toEqual([1, 2])
	})

	it('labels only the places with a name, most pieces first, eight at most', () => {
		const spots = Array.from({ length: 12 }, (_, i) => spot(`City ${String(i)}`, 30 + i, -100 + i))
		const dots = plot([...spots, spot('', 10, 10)], frame)
		expect(dots.filter((d) => d.label)).toHaveLength(8)
		expect(dots.find((d) => d.city === '')?.label).toBe(false)
	})
})
