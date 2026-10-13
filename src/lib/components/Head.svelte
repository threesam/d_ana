<script lang="ts">
	import { page } from '$app/state'
	import { card } from '#lib/content/image.ts'
	import { SITE } from '#lib/content/index.ts'
	import type { Image } from '#lib/content/types.ts'

	interface Props {
		title: string
		description: string
		/** The photograph a shared link shows. Without one the link is a card of words. */
		cover?: Image | null | undefined
	}

	let { title, description, cover = null }: Props = $props()

	// one page, one address: the real site's, whatever preview or laptop this was built on
	const address = $derived(SITE + page.url.pathname)
	const picture = $derived(cover === null ? null : { ...card(cover), alt: cover.alt })
</script>

<!-- What a page is called, and what a link to it looks like when it is shared in a message
     or a post (Open Graph, which every app that draws a card reads). -->
<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={address} />
	<meta property="og:site_name" content="d-ana" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={address} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	{#if picture}
		<meta property="og:image" content={picture.url} />
		<meta property="og:image:width" content={String(picture.width)} />
		<meta property="og:image:height" content={String(picture.height)} />
		<meta property="og:image:alt" content={picture.alt} />
	{/if}
	<meta name="twitter:card" content={picture ? 'summary_large_image' : 'summary'} />
</svelte:head>
