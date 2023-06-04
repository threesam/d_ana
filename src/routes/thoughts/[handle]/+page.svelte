<script>
	import PortableText from '$lib/components/PortableText.svelte';

	export let data;
</script>

<section class="grid grid-cols-1 border-b border-dark lg:grid-cols-2">
	<img src={data.post.image.asset.url} alt={data.post.title} />
	<h1 class="px-5 py-5 text-xl font-semibold lg:grid lg:place-content-center lg:px-10 lg:text-3xl">
		{data.post.title}
	</h1>
</section>

<section class="p-5 pb-0 lg:p-10">
	<PortableText blocks={data.post.body} />
</section>
