<script lang="ts">
	import { page } from '$app/state'
</script>

<svelte:head>
	<title>{page.status} | d-ana</title>
</svelte:head>

<section class="wrap title-page" data-seen={page.status} data-via="missing">
	<h1>{page.status}</h1>
	<p class="lede">{page.error?.message}</p>
	<p class="lede"><a href="/">Back to the years</a></p>
</section>
