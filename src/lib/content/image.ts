import { createImageUrlBuilder } from '@sanity/image-url'

const builder = createImageUrlBuilder({
	projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
	dataset: import.meta.env.VITE_SANITY_DATASET
})

const WIDTHS = [320, 480, 560, 640, 800, 960, 1080, 1440, 1920]
/** A thumbnail is drawn about a hundred pixels wide, far under the bottom of the ladder. */
const SMALL = [160, 240]
const TOP = 1920
/** What a browser with no `srcset` support gets. */
const FALLBACK = 800
/** Files this wide and wider only reach dense screens, where a lower quality cannot be seen. */
const DENSE = 960

/** The widths worth asking the CDN for: the ladder up to the photograph's own width, never past it. */
export function ladder(intrinsic: number, small = false): number[] {
	const steps = [...(small ? SMALL : []), ...WIDTHS].filter((w) => w <= intrinsic)
	if (intrinsic < TOP && !steps.includes(intrinsic)) steps.push(intrinsic)
	return steps
}

const url = (ref: string, width: number) =>
	builder
		.image(ref)
		.width(width)
		.quality(width >= DENSE ? 60 : 75)
		.fit('max')
		.auto('format')
		.url()

/** `src` and `srcset` for one photograph. Sanity's CDN resizes, and picks AVIF or WebP per browser. */
export function sources(
	image: { ref: string; width: number },
	small = false
): { src: string; srcset: string } {
	return {
		src: url(image.ref, Math.min(image.width, FALLBACK)),
		srcset: ladder(image.width, small)
			.map((w) => `${url(image.ref, w)} ${String(w)}w`)
			.join(', ')
	}
}

/** The shape the picture of a shared link is drawn in (Open Graph's 1200 by 630). */
const CARD = { width: 1200, height: 630 }

/**
 * The picture a shared link shows: the middle of the photograph cut to a card's shape, as a JPEG
 * (the one format every app that draws a card reads). Never larger than the photograph itself.
 */
export function card(image: { ref: string; width: number; height: number }): {
	url: string
	width: number
	height: number
} {
	let width = Math.min(CARD.width, image.width)
	let height = Math.round((width * CARD.height) / CARD.width)
	if (height > image.height) {
		height = image.height
		width = Math.round((height * CARD.width) / CARD.height)
	}
	const url = builder
		.image(image.ref)
		.width(width)
		.height(height)
		.fit('crop')
		.format('jpg')
		.quality(80)
		.url()
	return { url, width, height }
}

export type Slot = 'bleed' | 'first' | 'second' | 'strip'

/**
 * Where a photograph sits in a layout: its share of a wide screen, the most it reaches once the
 * column stops growing, its share of a phone, and how much of the screen's height it may fill.
 * These mirror the grid in Blocks.svelte. Keep the two in step.
 */
const SLOTS = {
	bleed: { wide: 46, most: 600, narrow: 77, tall: 92 },
	first: { wide: 38, most: 496, narrow: 69, tall: 82 },
	second: { wide: 30, most: 392, narrow: 69, tall: 82 }
}

/**
 * The `sizes` of one photograph: how wide it is really drawn, so the browser asks for a file that
 * fits and no bigger. A tall photograph is held to a share of the screen's height, which makes it
 * much narrower than its columns; saying only "40vw" had browsers fetch about twice the pixels.
 */
export function sizes(slot: Slot, image: { width: number; height: number }): string {
	const ratio = image.width / image.height
	// the row of four on the home page has a fixed height: clamp(96px, 13vw, 184px) in +page.svelte
	if (slot === 'strip')
		return `(min-width: 1416px) ${String(Math.round(184 * ratio))}px, (min-width: 739px) ${(13 * ratio).toFixed(1)}vw, ${String(Math.round(96 * ratio))}px`
	const { wide, most, narrow, tall } = SLOTS[slot]
	const capped = `${(tall * ratio).toFixed(1)}vh`
	return `(min-width: 860px) min(${String(wide)}vw, ${String(most)}px, ${capped}), min(${String(narrow)}vw, ${capped})`
}
