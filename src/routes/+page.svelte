<script lang="ts">
	import PortableText from '$lib/components/PortableText.svelte'
	import SEO from 'svelte-seo'
	import video from '$lib/assets/videos/sample.mp4'
	import devVideo from '$lib/assets/videos/dev-sample.mp4'
	import Play from '$lib/components/icons/Play.svelte'
	import Pause from '$lib/components/icons/Pause.svelte'

	export let data
	const { founder, title, description } = data.settings

	let isPaused: boolean = false

	function play(node: HTMLVideoElement) {
		if (!isPaused) {
			node.play()
		}
	}

	function handlePlayPauseClick() {
		const videoElement = document.getElementById('hero-video') as HTMLVideoElement

		isPaused = !isPaused
		if (!isPaused) {
			videoElement?.play()
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

<div class="relative aspect-video w-full pt-20 lg:px-10">
	<div class="group relative overflow-hidden">
		<video
			class="w-full"
			muted
			loop
			autoplay
			id="hero-video"
			src={process.env.NODE_ENV === 'development' ? devVideo : video}
			use:play
		></video>
		<button
			class="absolute bottom-5 left-5 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			on:click={handlePlayPauseClick}
		>
			{#if isPaused}
				<Play width={50} height={50} />
			{:else}
				<Pause width={50} height={50} />
			{/if}
		</button>
	</div>
</div>

<section class="grid grid-cols-2 py-10 lg:grid-cols-4 lg:gap-2 lg:px-10">
	{#each founder.imageGallery as image}
		<img
			class="aspect-square h-full w-full object-cover"
			src={image.url}
			alt={image.originalFilename}
		/>
	{/each}
</section>

<section class="grid grid-cols-1 gap-10 px-5 lg:grid-cols-2 lg:px-10">
	<img src={founder.image.asset.url} alt="d-ana's face" />
	<div class="flex flex-col gap-5 text-xl">
		<h1 class="text-5xl">I'm {founder?.name}.</h1>
		<PortableText blocks={founder?.bio} />
	</div>
</section>

{#if data.posts}
	<section class="flex w-full flex-col px-5 py-10 lg:px-10">
		<h2 class="mb-2 text-3xl">Thoughts</h2>
		<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-2">
			{#each data.posts as post}
				<div class="mb-5">
					<img src={post.image.asset.url} alt={post.title} />
					<h3 class="">{post.title}</h3>
					<a class="text-sm underline underline-offset-2" href={'/thoughts/' + post.slug.current}
						>read more</a
					>
				</div>
			{/each}
		</div>
	</section>
{/if}
