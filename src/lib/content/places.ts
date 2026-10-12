import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from 'd3-geo'

/** Where one piece was made. `city` may be empty. */
export interface Spot {
	city: string
	lat: number
	lng: number
}

export interface Dot {
	x: number
	y: number
	r: number
	count: number
	city: string
	label: boolean
	/** Which side of the dot its name is printed on. */
	anchor: 'start' | 'end'
}

export interface Frame {
	width: number
	height: number
	pad: number
}

/** What to draw under the pins: the continents, and optionally the borders between countries. */
export interface World {
	land: GeoPermissibleObjects
	borders?: GeoPermissibleObjects | undefined
}

export interface Chart {
	dots: Dot[]
	/** SVG path data for the continents. Empty when no world was given. */
	land: string
	/** SVG path data for the borders between countries. Empty when none were given. */
	borders: string
}

const LABELS = 8
// room one printed name needs, in frame units: names closer than this would overprint
const LABEL_W = 120
const LABEL_H = 16

/**
 * A pin board: the whole world in view, with one pin per place, bigger where more was made.
 * The view never zooms to the pins, so a place sits where it does on any world map.
 */
export function plot(spots: Spot[], frame: Frame, world?: World): Chart {
	const groups = new Map<string, Spot[]>()
	for (const spot of spots) {
		const key = spot.city === '' ? `${spot.lat.toFixed(1)},${spot.lng.toFixed(1)}` : spot.city
		groups.set(key, [...(groups.get(key) ?? []), spot])
	}
	if (groups.size === 0) return { dots: [], land: '', borders: '' }

	const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length
	const places = [...groups.values()].map((members) => ({
		city: members[0]?.city ?? '',
		count: members.length,
		point: [mean(members.map((m) => m.lng)), mean(members.map((m) => m.lat))] as [number, number]
	}))

	const projection = geoNaturalEarth1()
		.clipExtent([
			[0, 0],
			[frame.width, frame.height]
		])
		.fitExtent(
			[
				[frame.pad, frame.pad],
				[frame.width - frame.pad, frame.height - frame.pad]
			],
			{ type: 'Sphere' }
		)

	// one decimal is finer than a pixel and keeps the markup short
	const round = (n: number) => Math.round(n * 10) / 10
	const dots: Dot[] = places.map((p) => {
		const [px, py] = projection(p.point) ?? [0, 0]
		const x = round(px)
		return {
			x,
			y: round(py),
			r: round(2 + 1.6 * Math.sqrt(p.count)),
			count: p.count,
			city: p.city,
			label: false,
			anchor: x > frame.width - frame.pad - LABEL_W ? 'end' : 'start'
		}
	})

	// name the fullest places first, and skip any whose name would print over one already there
	const named: Dot[] = []
	for (const dot of [...dots].sort((a, b) => b.count - a.count)) {
		if (named.length === LABELS) break
		if (dot.city === '') continue
		const clear = named.every(
			(n) => Math.abs(n.x - dot.x) > LABEL_W || Math.abs(n.y - dot.y) > LABEL_H
		)
		if (clear) {
			dot.label = true
			named.push(dot)
		}
	}

	const path = geoPath(projection).digits(1)
	return {
		dots,
		land: world === undefined ? '' : (path(world.land) ?? ''),
		borders: world?.borders === undefined ? '' : (path(world.borders) ?? '')
	}
}
