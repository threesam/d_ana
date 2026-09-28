<script lang="ts">
	import { dev } from '$app/environment'
	import PortableText from '$lib/components/PortableText.svelte'
	import SEO from 'svelte-seo'
	import video from '$lib/assets/videos/sample.mp4'
	import devVideo from '$lib/assets/videos/dev-sample.mp4'
	import Play from '$lib/components/icons/Play.svelte'
	import Pause from '$lib/components/icons/Pause.svelte'
	import BioBlock from '$lib/components/BioBlock.svelte'
	import { urlFor } from '$lib/utils/sanity'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()
	const { founder, title, description } = $derived(data.settings)

	let isPaused = $state(false)
	let videoElement: HTMLVideoElement | undefined = $state()

	function play(node: HTMLVideoElement) {
		if (!isPaused) {
			void node.play()
		}
	}

	function handlePlayPauseClick() {
		isPaused = !isPaused
		if (!isPaused) {
			void videoElement?.play()
		} else {
			videoElement?.pause()
		}
	}
</script>

<SEO
	{title}
	{description}
	openGraph={{
		title,
		description,
		type: 'website',
		images: [{ url: founder.image.asset.url }]
	}}
/>

<div class="relative aspect-video w-full pt-20 pb-32 lg:px-10">
	<div class="relative overflow-hidden">
		<video
			class="w-full"
			muted
			loop
			autoplay
			id="hero-video"
			src={dev ? devVideo : video}
			bind:this={videoElement}
			use:play
		></video>
		<button
			class="absolute inset-0 text-white opacity-0 transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100"
			onclick={handlePlayPauseClick}
		>
			<span class="absolute bottom-5 left-5 lg:bottom-10 lg:left-10">
				<!-- Labels live inside the {#if}: a reactive attribute on this template would share
				     its update effect with the video's src and restart the video on every toggle. -->
				{#if isPaused}
					<Play width={50} height={50} />
					<span class="sr-only">Play video</span>
				{:else}
					<Pause width={50} height={50} />
					<span class="sr-only">Pause video</span>
				{/if}</span
			>
		</button>
	</div>
</div>

<section class="grid grid-cols-2 bg-gray-100 py-32 lg:grid-cols-4 lg:gap-10 lg:px-10">
	{#each founder.imageGallery as image, i (i)}
		{@const img = urlFor(image).auto('format')}
		<!-- alt comes from the Studio; without it the photo is decorative (filenames like IMG_6368.JPG aren't alt text) -->
		<img
			class="aspect-square h-full w-full object-cover"
			src={img.width(800).url()}
			srcset="{img.width(600).url()} 600w, {img.width(1200).url()} 1200w"
			sizes="(min-width: 1024px) 25vw, 50vw"
			alt={image.alt ?? ''}
		/>
	{/each}
</section>

<section class="grid grid-cols-1 gap-10 px-5 py-32 lg:grid-cols-2 lg:px-10">
	<img
		class="ring-2 ring-black"
		src={urlFor(founder.image.asset).auto('format').url()}
		width={founder.image.asset.metadata.dimensions.width}
		height={founder.image.asset.metadata.dimensions.height}
		alt="d-ana's face"
		loading="lazy"
	/>
	<div class="flex flex-col gap-5 text-xl">
		<h1 class="text-5xl">I'm {founder.name}.</h1>
		<PortableText blocks={founder.bio} components={{ block: BioBlock }} />
	</div>
</section>

<section class="flex w-full flex-col bg-gray-100 px-5 py-32 lg:px-10">
	<h2 class="mb-2 text-3xl">Thoughts</h2>
	<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
		{#each data.posts as post (post._id)}
			<div class="mb-5">
				<img
					class="mb-2 ring-2 ring-black"
					src={urlFor(post.image.asset).auto('format').url()}
					width={post.image.asset.metadata.dimensions.width}
					height={post.image.asset.metadata.dimensions.height}
					alt={post.title}
					loading="lazy"
				/>
				<h3 class="">{post.title}</h3>
				<a class="text-sm underline underline-offset-2" href={'/thoughts/' + post.slug.current}
					>read more<span class="sr-only">: {post.title}</span></a
				>
			</div>
		{/each}
	</div>
</section>
