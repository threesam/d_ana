<script>
	import PortableText from '$lib/components/PortableText.svelte'
	import SEO from 'svelte-seo'
	import video from '$lib/assets/videos/sample.mp4'
	import devVideo from '$lib/assets/videos/dev-sample.mp4'

	export let data
	const { founder, title, description } = data.settings
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

<video
	class="lg:px-10 pt-20"
	muted
	loop
	autoplay
	src={process.env.NODE_ENV === 'development' ? devVideo : video}
></video>

<section class="grid grid-cols-2 lg:grid-cols-4 py-10 lg:gap-2 lg:px-10">
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
