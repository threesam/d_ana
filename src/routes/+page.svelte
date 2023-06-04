<script>
	import PortableText from '$lib/components/PortableText.svelte';
	import SEO from 'svelte-seo';

	export let data;
	console.log('data: ', data);
	const { founder, title, description } = data.settings;
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

<section class="grid grid-cols-1 gap-10 px-5 pb-10 lg:grid-cols-2 lg:px-10">
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
