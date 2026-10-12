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

const LABELS = 8
// room one printed name needs, in frame units: names closer than this would overprint
const LABEL_W = 150
const LABEL_H = 18

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

	// one decimal is finer than a pixel and keeps the markup short
	const round = (n: number) => Math.round(n * 10) / 10
	const dots = flat.map((p) => {
		const x = round(offsetX + (p.px - Math.min(...xs)) * fit)
		return {
			x,
			y: round(offsetY + (p.py - Math.min(...ys)) * fit),
			r: round(2 + 1.6 * Math.sqrt(p.count)),
			count: p.count,
			city: p.city,
			label: false,
			anchor: x > frame.width - frame.pad - LABEL_W ? ('end' as const) : ('start' as const)
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

	return dots
}
