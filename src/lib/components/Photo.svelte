<script lang="ts">
	import { sources } from '#lib/content/image.ts'
	import type { Image } from '#lib/content/types.ts'

	interface Props {
		image: Image
		/** How wide the photograph is drawn, as a `sizes` value, so the browser asks for the right file. */
		sizes: string
		/** The first photograph on a page: load it now, ahead of everything else. */
		eager?: boolean | undefined
		/** Inside a link that already has a name, the photograph says nothing more. */
		decorative?: boolean | undefined
	}

	let { image, sizes, eager = false, decorative = false }: Props = $props()

	const source = $derived(sources(image))
</script>

<img
	src={source.src}
	srcset={source.srcset}
	{sizes}
	width={image.width}
	height={image.height}
	alt={decorative ? '' : image.alt}
	loading={eager ? 'eager' : 'lazy'}
	fetchpriority={eager ? 'high' : 'auto'}
	decoding="async"
	style:background-color={image.tone}
/>
