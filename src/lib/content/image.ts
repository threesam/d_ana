import { createImageUrlBuilder } from '@sanity/image-url'

const builder = createImageUrlBuilder({
	projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
	dataset: import.meta.env.VITE_SANITY_DATASET
})

const WIDTHS = [320, 480, 640, 800, 1080, 1440, 1920]
const TOP = 1920
/** What a browser with no `srcset` support gets. */
const FALLBACK = 800

/** The widths worth asking the CDN for: the ladder up to the photograph's own width, never past it. */
export function ladder(intrinsic: number): number[] {
	const steps = WIDTHS.filter((w) => w <= intrinsic)
	if (intrinsic < TOP && !steps.includes(intrinsic)) steps.push(intrinsic)
	return steps
}

const url = (ref: string, width: number) =>
	builder.image(ref).width(width).quality(75).fit('max').auto('format').url()

/** `src` and `srcset` for one photograph. Sanity's CDN resizes, and picks AVIF or WebP per browser. */
export function sources(image: { ref: string; width: number }): { src: string; srcset: string } {
	return {
		src: url(image.ref, Math.min(image.width, FALLBACK)),
		srcset: ladder(image.width)
			.map((w) => `${url(image.ref, w)} ${String(w)}w`)
			.join(', ')
	}
}
