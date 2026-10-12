import type { Image } from './types.ts'

export interface YearSummary {
	year: number
	count: number
	/** Up to four photographs spread across the year, in order. */
	frames: Image[]
}

const FRAMES = 4

/** The home page index: how many pieces each year holds, and a few photographs to stand for it. */
export function summarize(rows: { day: string; image: Image }[]): YearSummary[] {
	const years = new Map<number, Image[]>()
	for (const row of rows) {
		const year = Number(row.day.slice(0, 4))
		years.set(year, [...(years.get(year) ?? []), row.image])
	}
	return [...years.entries()]
		.sort(([a], [b]) => b - a)
		.map(([year, images]) => {
			const step = images.length > FRAMES ? Math.floor(images.length / FRAMES) : 1
			const frames = images.filter((_, i) => i % step === 0).slice(0, FRAMES)
			return { year, count: images.length, frames }
		})
}

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`)
const dayFormat = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'short',
	timeZone: 'UTC'
})
const monthFormat = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' })

/** `2024-03-14` as `14 Mar`. */
export const dayLabel = (day: string) => dayFormat.format(utc(day))

/** `2019-03` as `March`, or `March 2019`. */
export function monthLabel(month: string, withYear = false) {
	const name = monthFormat.format(utc(`${month}-01`))
	return withYear ? `${name} ${month.slice(0, 4)}` : name
}

export interface Words {
	text: string
	/** The account this part names, without the `@`, or null for plain words. */
	handle: string | null
}

// an account name: letters, digits, _ and ., never ending on a dot, and not the tail of an email
const ACCOUNT = /(?<![\w.@])@([\w](?:[\w.]*[\w])?)/g

/** Her words cut into plain parts and the accounts she named, so a name can be its own link. */
export function mentions(text: string): Words[] {
	const parts: Words[] = []
	let at = 0
	for (const match of text.matchAll(ACCOUNT)) {
		if (match.index > at) parts.push({ text: text.slice(at, match.index), handle: null })
		parts.push({ text: match[0], handle: match[1] ?? null })
		at = match.index + match[0].length
	}
	if (at < text.length) parts.push({ text: text.slice(at), handle: null })
	return parts
}

/** The people tagged on a piece whose names her words do not already carry. */
export function unnamed(people: string[], text: string | null) {
	const named = new Set(
		mentions(text ?? '').flatMap((part) =>
			part.handle === null ? [] : [part.handle.toLowerCase()]
		)
	)
	// ponytail: some imported names kept the sentence's full stop; trimmed here, not in the data
	return people
		.map((person) => person.replace(/\.+$/, ''))
		.filter((person) => !named.has(person.slice(1).toLowerCase()))
}
