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
		/** A thumbnail: also offer the files under 320px wide. */
		small?: boolean | undefined
	}

	let { image, sizes, eager = false, decorative = false, small = false }: Props = $props()

	const source = $derived(sources(image, small))
	// four places is finer than a pixel at any size drawn, and a quarter of the characters in every tag
	const ratio = $derived(Math.round((image.width / image.height) * 1e4) / 1e4)
</script>

<!-- `lone`: a photograph on its own is the box the layouts size and place (`.photo`); under a
     video the box is the frame around the two of them. -->
{#snippet still(lone: boolean)}
	<img
		class={[lone && 'photo']}
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
		style:--ratio={ratio}
	/>
{/snippet}

{#if image.video && !decorative}
	<!-- The still is an ordinary lazy photograph and the video lies over it, empty until it plays:
	     a `poster` would be fetched for every video on the page at once. No sound, no controls.
	     It plays while it is on screen; a tap or Enter stops and starts it (the script in app.html). -->
	<div class="photo plays" style:background-color={image.tone} style:--ratio={ratio}>
		{@render still(false)}
		<video
			aria-label="Video. Press Enter to stop or start it"
			preload="none"
			muted
			loop
			playsinline
			tabindex="0"
		>
			<source src={image.video} type="video/mp4" />
		</video>
	</div>
{:else}
	{@render still(true)}
{/if}

<style>
	.plays {
		position: relative;
	}
	.plays img,
	.plays video {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.plays video {
		position: absolute;
		inset: 0;
	}
</style>
