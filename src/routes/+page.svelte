<script lang="ts">
	import { dev } from '$app/environment'
	import PortableText from '$lib/components/PortableText.svelte'
	import SEO from 'svelte-seo'
	import video from '$lib/assets/videos/sample.mp4'
	import devVideo from '$lib/assets/videos/dev-sample.mp4'
	import Play from '$lib/components/icons/Play.svelte'
	import Pause from '$lib/components/icons/Pause.svelte'
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
			class="absolute inset-0 text-white opacity-0 transition-opacity duration-300 hover:opacity-100"
			onclick={handlePlayPauseClick}
		>
			<span class="absolute bottom-5 left-5 lg:bottom-10 lg:left-10">
				{#if isPaused}
					<Play width={50} height={50} />
				{:else}
					<Pause width={50} height={50} />
				{/if}</span
			>
		</button>
	</div>
</div>

<section class="grid grid-cols-2 bg-gray-100 py-32 lg:grid-cols-4 lg:gap-10 lg:px-10">
	{#each founder.imageGallery as image, i (i)}
		<img
			class="aspect-square h-full w-full object-cover"
			src={image.url}
			alt={image.originalFilename}
		/>
	{/each}
</section>

<section class="grid grid-cols-1 gap-10 px-5 py-32 lg:grid-cols-2 lg:px-10">
	<img class="ring-2 ring-black" src={founder.image.asset.url} alt="d-ana's face" />
	<div class="flex flex-col gap-5 text-xl">
		<h1 class="text-5xl">I'm {founder.name}.</h1>
		<PortableText blocks={founder.bio} />
	</div>
</section>

<section class="flex w-full flex-col bg-gray-100 px-5 py-32 lg:px-10">
	<h2 class="mb-2 text-3xl">Thoughts</h2>
	<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
		{#each data.posts as post (post._id)}
			<div class="mb-5">
				<img class="mb-2 ring-2 ring-black" src={post.image.asset.url} alt={post.title} />
				<h3 class="">{post.title}</h3>
				<a class="text-sm underline underline-offset-2" href={'/thoughts/' + post.slug.current}
					>read more</a
				>
			</div>
		{/each}
	</div>
</section>
