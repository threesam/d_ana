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
}

export interface Frame {
	width: number
	height: number
	pad: number
}

const LABELS = 8

/**
 * A map with no map: one dot per place, bigger where more was made, laid out by longitude and
 * latitude and scaled to fit the frame.
 * ponytail: plain equirectangular projection, fine for a scatter of dots; reach for d3-geo if a
 * coastline is ever drawn under them.
 */
export function plot(spots: Spot[], frame: Frame): Dot[] {
	const groups = new Map<string, Spot[]>()
	for (const spot of spots) {
		const key = spot.city === '' ? `${spot.lat.toFixed(1)},${spot.lng.toFixed(1)}` : spot.city
		groups.set(key, [...(groups.get(key) ?? []), spot])
	}
	if (groups.size === 0) return []

	const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length
	const places = [...groups.values()].map((members) => ({
		city: members[0]?.city ?? '',
		count: members.length,
		lat: mean(members.map((m) => m.lat)),
		lng: mean(members.map((m) => m.lng))
	}))

	const lats = places.map((p) => p.lat)
	const squeeze = Math.cos((mean([Math.min(...lats), Math.max(...lats)]) * Math.PI) / 180)
	const flat = places.map((p) => ({ ...p, px: p.lng * squeeze, py: -p.lat }))
	const xs = flat.map((p) => p.px)
	const ys = flat.map((p) => p.py)
	const spanX = Math.max(...xs) - Math.min(...xs)
	const spanY = Math.max(...ys) - Math.min(...ys)
	const innerW = frame.width - 2 * frame.pad
	const innerH = frame.height - 2 * frame.pad
	const scale = Math.min(
		spanX > 0 ? innerW / spanX : Infinity,
		spanY > 0 ? innerH / spanY : Infinity
	)
	const fit = Number.isFinite(scale) ? scale : 0
	const offsetX = (frame.width - spanX * fit) / 2
	const offsetY = (frame.height - spanY * fit) / 2

	const labelled = new Set(
		flat
			.filter((p) => p.city !== '')
			.sort((a, b) => b.count - a.count)
			.slice(0, LABELS)
			.map((p) => p.city)
	)

	// one decimal is finer than a pixel and keeps the markup short
	const round = (n: number) => Math.round(n * 10) / 10

	return flat.map((p) => ({
		x: round(offsetX + (p.px - Math.min(...xs)) * fit),
		y: round(offsetY + (p.py - Math.min(...ys)) * fit),
		r: round(2 + 1.6 * Math.sqrt(p.count)),
		count: p.count,
		city: p.city,
		label: labelled.has(p.city)
	}))
}
