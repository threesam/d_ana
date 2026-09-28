<script lang="ts">
	import { onMount } from 'svelte'
	import Instagram from './icons/Instagram.svelte'
	import TikTok from './icons/TikTok.svelte'

	const characters = 'I_E-'
	let scrollY = $state(0)
	let character = $state('-')

	onMount(() => {
		let index = 0
		const interval = setInterval(() => {
			character = characters.charAt(index % characters.length)
			index++
		}, 2000)

		return () => {
			clearInterval(interval)
		}
	})
</script>

<svelte:window bind:scrollY />

<header
	class={`fixed z-10 flex w-full justify-between bg-white p-5 lg:px-10 ${scrollY > 0 ? 'border-b-2 border-black transition-all duration-150' : ''}`}
>
	<a href="/" class="text-4xl tracking-widest" aria-label="d-ana home">
		D<span class="inline-block w-7 text-center">{character}</span>ANA
	</a>

	<div class="flex gap-5 *:overflow-hidden *:rounded-xl">
		<a href="https://tiktok.com/@d_ana___" aria-label="TikTok">
			<TikTok width={40} height={40} />
		</a>
		<a href="https://www.instagram.com/__d_ana___" aria-label="Instagram">
			<Instagram width={40} height={40} />
		</a>
	</div>
</header>
