import { createClient } from '@sanity/client'
import { building } from '$app/env'
import type { Spot } from '#lib/content/places.ts'
import type { Image, Piece, Theme } from '#lib/content/types.ts'

// Every page is prerendered, so these run at build time only. The dataset the site reads is
// public and holds only pieces cleared to be seen, so no token is needed here.
const client = createClient({
	projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
	dataset: import.meta.env.VITE_SANITY_DATASET,
	apiVersion: '2025-02-19',
	useCdn: false
})

/** The site reads shown pieces and nothing else. Hiding a piece is the only switch there is. */
const SHOWN = `_type == "post" && visibility == "shown"`

const IMAGE = `{
	"key": _key,
	"ref": asset._ref,
	"alt": coalesce(alt, ""),
	"width": asset->metadata.dimensions.width,
	"height": asset->metadata.dimensions.height,
	"tone": asset->metadata.palette.dominant.background,
	"video": coalesce(video.asset->url, null)
}`

const PIECE = `{
	"handle": handle.current,
	kind,
	day,
	"title": coalesce(title, null),
	"text": coalesce(text, null),
	"images": coalesce(images[defined(asset)]${IMAGE}, []),
	"place": select(defined(place.point) => {
		"name": coalesce(place.name, ""),
		"city": coalesce(place.city, ""),
		"lat": place.point.lat,
		"lng": place.point.lng
	}, null),
	"people": coalesce(people, []),
	"themes": coalesce(themes[]->{ "handle": handle.current, title }, [])
}`

/**
 * While the site is being built, a question every page asks (the years, the themes) is put to
 * Sanity once and the answer shared. Anywhere else it is asked afresh, so a change shows.
 */
const once = <T>(ask: () => Promise<T>) => {
	let answer: Promise<T> | undefined
	return () => (building ? (answer ??= ask()) : ask())
}

/** The first photograph of every shown piece, oldest first: what the home page index is built from. */
export const frames = once(() =>
	client.fetch<{ day: string; image: Image }[]>(
		`*[${SHOWN} && defined(images[0].asset)] | order(publishedAt asc) { day, "image": images[0]${IMAGE} }`
	)
)

/** The sentences she wrote to open each year. A year with none is simply absent. */
export const intros = once(() =>
	client.fetch<{ year: number; intro: string }[]>(
		`*[_type == "year" && defined(intro)] { year, intro }`
	)
)

export const piecesOfYear = (year: number) =>
	client.fetch<Piece[]>(
		`*[${SHOWN} && day >= $from && day <= $to] | order(publishedAt asc) ${PIECE}`,
		{ from: `${String(year)}-01-01`, to: `${String(year)}-12-31` }
	)

export interface ThemeSummary extends Theme {
	description: string | null
	count: number
}

const THEME = `{
	"handle": handle.current,
	title,
	"description": coalesce(description, null),
	"count": count(*[${SHOWN} && references(^._id)])
}`

/** Themes that have at least one shown piece, fullest first. */
export const themes = once(() =>
	client.fetch<ThemeSummary[]>(`*[_type == "theme"] ${THEME} [count > 0] | order(count desc)`)
)

export const theme = (handle: string) =>
	client.fetch<(ThemeSummary & { pieces: Piece[] }) | null>(
		`*[_type == "theme" && handle.current == $handle][0] {
			"handle": handle.current,
			title,
			"description": coalesce(description, null),
			"pieces": *[${SHOWN} && references(^._id)] | order(publishedAt asc) ${PIECE}
		} { ..., "count": count(pieces) }`,
		{ handle }
	)

/** One spot per shown piece that carries a place. Points were rounded to about 1 km on import. */
export const spots = () =>
	client.fetch<Spot[]>(
		`*[${SHOWN} && defined(place.point)] {
			"city": coalesce(place.city, ""),
			"lat": place.point.lat,
			"lng": place.point.lng
		}`
	)
