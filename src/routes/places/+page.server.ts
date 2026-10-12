import { feature, mesh } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import atlas from 'world-atlas/countries-110m.json'
import { plot } from '#lib/content/places.ts'
import { frames, spots } from '#lib/server/content.ts'
import type { PageServerLoad } from './$types'

const FRAME = { width: 1200, height: 620, pad: 20 }

// Natural Earth at 1:110m: coarse on purpose, a paper cut-out of the world rather than a map
// to navigate by. The continents are filled shapes; the borders are each drawn once, as lines.
const topology = atlas as unknown as Topology<{
	countries: GeometryCollection
	land: GeometryCollection
}>
const world = {
	land: feature(topology, topology.objects.land),
	borders: mesh(topology, topology.objects.countries, (a, b) => a !== b)
}

export const load: PageServerLoad = async () => {
	const [found, rows] = await Promise.all([spots(), frames()])
	const { dots, land, borders } = plot(found, FRAME, world)
	return {
		// a shared link to the map shows her latest photograph (the board itself is drawn, not a file)
		cover: rows.at(-1)?.image ?? null,
		frame: FRAME,
		dots,
		land,
		borders,
		cities: dots.filter((d) => d.city !== '').sort((a, b) => b.count - a.count)
	}
}
