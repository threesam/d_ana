<script lang="ts">
	import { page } from '$app/state'
</script>

<svelte:head>
	<title>{page.status} | d-ana</title>
</svelte:head>

<section class="px-5 pt-40 pb-32 text-center lg:px-10">
	<h1 class="text-5xl">{page.status}</h1>
	<p class="mt-5 text-xl">{page.error?.message}</p>
</section>
