<script lang="ts">
	interface Link {
		title: string
		href: string
	}

	import { scale } from 'svelte/transition'

	export let color = '#b7c6af'
	export let size = 69
	export let links: Link[] = []

	import Facebook from './icons/Facebook.svelte'
	import Imdb from './icons/Imdb.svelte'
	import Instagram from './icons/Instagram.svelte'
	import LinkedIn from './icons/LinkedIn.svelte'
	import TikTok from './icons/TikTok.svelte'
	import Website from './icons/Website.svelte'
	import Youtube from './icons/Youtube.svelte'
	import Message from './icons/Message.svelte'

	const options = [
		{ title: 'facebook', component: Facebook },
		{ title: 'imdb', component: Imdb },
		{ title: 'instagram', component: Instagram },
		{ title: 'linkedin', component: LinkedIn },
		{ title: 'tiktok', component: TikTok },
		{ title: 'website', component: Website },
		{ title: 'youtube', component: Youtube },
		{ title: 'contact', component: Message }
	]

	const getIconComponent = (title: string) =>
		options.find((option) => option.title === title)?.component
</script>

{#if links?.length}
	<div class="grid grid-cols-2 items-center justify-between gap-5 lg:flex">
		{#each links as { href, title }, i}
			<a
				style={`color: ${color};`}
				class="flex items-center transition duration-300 hover:scale-90"
				in:scale={{ delay: (i + 1) * 100 + 500, start: 0 }}
				{href}
				aria-label={title}
			>
				<svelte:component this={getIconComponent(title)} {color} width={size} height={size} />
			</a>
		{/each}
	</div>
{/if}
