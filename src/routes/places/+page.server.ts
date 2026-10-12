import { plot } from '#lib/content/places.ts'
import { spots } from '#lib/server/content.ts'
import type { PageServerLoad } from './$types'

const FRAME = { width: 1200, height: 620, pad: 48 }

export const load: PageServerLoad = async () => {
	const dots = plot(await spots(), FRAME)
	return {
		frame: FRAME,
		dots,
		cities: dots.filter((d) => d.city !== '').sort((a, b) => b.count - a.count)
	}
}
