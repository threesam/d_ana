<script lang="ts">
	import PortableText from '$lib/components/PortableText.svelte'
	import SEO from 'svelte-seo'
	import { toPlainText } from '@portabletext/svelte'
	import { urlFor } from '$lib/utils/sanity'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()
	// Posts have no description yet; fall back to the opening of the body.
	const description = $derived(
		data.post.description ?? toPlainText([data.post.body].flat()).slice(0, 155)
	)
</script>

<SEO
	title={data.post.title}
	{description}
	openGraph={{
		title: data.post.title,
		description,
		images: [{ url: data.post.image.asset.url }]
	}}
/>

<section class="grid grid-cols-1 border-b border-dark pt-20 lg:grid-cols-2">
	<img
		src={urlFor(data.post.image.asset).auto('format').url()}
		width={data.post.image.asset.metadata.dimensions.width}
		height={data.post.image.asset.metadata.dimensions.height}
		alt={data.post.title}
	/>
	<h1 class="px-5 py-5 text-xl font-semibold lg:grid lg:place-content-center lg:px-10 lg:text-3xl">
		{data.post.title}
	</h1>
</section>

<section class="p-5 pb-0 lg:p-10">
	<div class="mx-auto max-w-3xl">
		<PortableText blocks={data.post.body} />
	</div>
</section>
