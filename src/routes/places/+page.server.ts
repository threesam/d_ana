import { mesh } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import atlas from 'world-atlas/countries-110m.json'
import { plot } from '#lib/content/places.ts'
import { spots } from '#lib/server/content.ts'
import type { PageServerLoad } from './$types'

const FRAME = { width: 1200, height: 700, pad: 56 }

// Every coastline and border once, as lines. Natural Earth at 1:110m: coarse on purpose, an
// ink sketch of the world rather than a map to navigate by.
const topology = atlas as unknown as Topology<{ countries: GeometryCollection }>
const world = mesh(topology, topology.objects.countries)

export const load: PageServerLoad = async () => {
	const { dots, land } = plot(await spots(), FRAME, world)
	return {
		frame: FRAME,
		dots,
		land,
		cities: dots.filter((d) => d.city !== '').sort((a, b) => b.count - a.count)
	}
}
