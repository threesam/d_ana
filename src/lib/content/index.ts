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
