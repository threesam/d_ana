import { geoMercator, geoPath, type GeoPermissibleObjects } from 'd3-geo'

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

export interface Chart {
	dots: Dot[]
	/** SVG path data for the coastlines and borders inside the frame. Empty when no world was given. */
	land: string
}

const LABELS = 8
// room one printed name needs, in frame units: names closer than this would overprint
const LABEL_W = 150
const LABEL_H = 18
/** Mercator scale for a map with a single place on it: roughly a country wide. */
const ALONE = 900

/**
 * An ink map: the world's outline drawn under one dot per place, bigger where more was made.
 * The view is fitted to the places, so it shows only the part of the world she has been in.
 */
export function plot(spots: Spot[], frame: Frame, world?: GeoPermissibleObjects): Chart {
	const groups = new Map<string, Spot[]>()
	for (const spot of spots) {
		const key = spot.city === '' ? `${spot.lat.toFixed(1)},${spot.lng.toFixed(1)}` : spot.city
		groups.set(key, [...(groups.get(key) ?? []), spot])
	}
	if (groups.size === 0) return { dots: [], land: '' }

	const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length
	const places = [...groups.values()].map((members) => ({
		city: members[0]?.city ?? '',
		count: members.length,
		point: [mean(members.map((m) => m.lng)), mean(members.map((m) => m.lat))] as [number, number]
	}))

	const projection = geoMercator().clipExtent([
		[0, 0],
		[frame.width, frame.height]
	])
	projection.fitExtent(
		[
			[frame.pad, frame.pad],
			[frame.width - frame.pad, frame.height - frame.pad]
		],
		{ type: 'MultiPoint', coordinates: places.map((p) => p.point) }
	)
	// one place (or several on one spot) has no extent to fit: centre it at a fixed scale
	const first = places[0]
	if (first !== undefined && (places.length === 1 || !Number.isFinite(projection.scale()))) {
		projection
			.scale(ALONE)
			.center(first.point)
			.translate([frame.width / 2, frame.height / 2])
	}

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

	const land = world === undefined ? '' : (geoPath(projection).digits(1)(world) ?? '')
	return { dots, land }
}
