import { describe, expect, it } from 'vitest'
import { plot } from './places.ts'

// the frame the places page draws in
const frame = { width: 1200, height: 620, pad: 20 }
const spot = (city: string, lat: number, lng: number) => ({ city, lat, lng })

describe('plot', () => {
	it('draws nothing when there are no places', () => {
		expect(plot([], frame)).toEqual({ dots: [], land: '', borders: '' })
	})

	it('puts a place where it is in the world, with the whole world in view', () => {
		const [dot] = plot([spot('Reykjavik', 64.15, -21.94)], frame).dots
		// Iceland: a little west of the middle of a world map, and well north of it
		expect(dot?.x).toBeGreaterThan(500)
		expect(dot?.x).toBeLessThan(600)
		expect(dot?.y).toBeLessThan(200)
		expect(dot).toMatchObject({ count: 1, city: 'Reykjavik' })
	})

	it('does not zoom in when every place is close together', () => {
		const { dots } = plot([spot('Austin', 30.27, -97.74), spot('Dallas', 32.78, -96.8)], frame)
		const [a, b] = dots
		expect(Math.abs((a?.x ?? 0) - (b?.x ?? 0))).toBeLessThan(10)
	})

	it('keeps west on the left and north at the top, inside the frame', () => {
		const { dots } = plot([spot('Austin', 30.27, -97.74), spot('Budapest', 47.5, 19.04)], frame)
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
		const { dots } = plot(
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
		const { dots } = plot(
			[spot('', 44.01, -110.02), spot('', 44.03, -110.04), spot('', 36.1, -112.1)],
			frame
		)
		expect(dots.map((d) => d.count).sort()).toEqual([1, 2])
	})

	it('does not label two places whose names would print over each other', () => {
		const { dots } = plot(
			[
				spot('Philadelphia', 39.95, -75.16),
				spot('Philadelphia', 39.95, -75.16),
				spot('Camden', 39.94, -75.12),
				spot('Portland', 45.52, -122.68)
			],
			frame
		)
		expect(dots.find((d) => d.city === 'Philadelphia')?.label).toBe(true)
		expect(dots.find((d) => d.city === 'Camden')?.label).toBe(false)
		expect(dots.find((d) => d.city === 'Portland')?.label).toBe(true)
	})

	it('prints a name to the left of a dot that sits at the right edge', () => {
		const { dots } = plot([spot('Portland', 45.52, -122.68), spot('Suva', -18.14, 178.44)], frame)
		expect(dots.find((d) => d.city === 'Suva')?.anchor).toBe('end')
		expect(dots.find((d) => d.city === 'Portland')?.anchor).toBe('start')
	})

	it('labels only the places with a name, most pieces first, eight at most', () => {
		// twelve cities spread right across the world, far enough apart for every name to fit
		const spots = Array.from({ length: 12 }, (_, i) =>
			spot(`City ${String(i)}`, i % 2 === 0 ? 50 : -30, -165 + i * 30)
		)
		const { dots } = plot([...spots, spot('', 10, 10)], frame)
		expect(dots.filter((d) => d.label)).toHaveLength(8)
		expect(dots.find((d) => d.city === '')?.label).toBe(false)
	})

	it('draws the coastline under the dots, cut off at the edge of the frame', () => {
		const coast = {
			type: 'LineString' as const,
			coordinates: [
				[-170, 10],
				[-100, 25],
				[-60, 45],
				[60, 70]
			]
		}
		const { land, borders } = plot(
			[spot('Austin', 30.27, -97.74), spot('Budapest', 47.5, 19.04)],
			frame,
			{ land: coast }
		)
		expect(borders).toBe('')
		expect(land.startsWith('M')).toBe(true)
		const numbers = land.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
		expect(numbers.length).toBeGreaterThan(3)
		expect(Math.min(...numbers)).toBeGreaterThanOrEqual(0)
		expect(Math.max(...numbers)).toBeLessThanOrEqual(frame.width)
	})

	it('draws no coastline when it is given none', () => {
		expect(plot([spot('Austin', 30.27, -97.74)], frame).land).toBe('')
	})
})
