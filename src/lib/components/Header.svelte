<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import Instagram from './icons/Instagram.svelte'
	import TikTok from './icons/TikTok.svelte'

	let characters = ['I', '_', 'E', '-']
	let scrollY = 0

	$: index = 0
	$: character = '-'

	let interval: number | undefined = undefined
	onMount(() => {
		interval = setInterval(() => {
			character = characters[index % characters.length]
			index++
		}, 2000)
	})

	onDestroy(() => clearInterval(interval))
</script>

<svelte:window bind:scrollY />

<header
	class={`fixed flex w-full justify-between bg-white p-5 lg:px-10 ${scrollY > 0 ? 'border-b-2 border-black transition-all duration-150' : ''}`}
>
	<a href="/" class="corner bold text-4xl tracking-widest">
		D<span class="inline-block w-7 text-center">{character}</span>ANA
	</a>

	<div class="flex gap-5 [&>*]:overflow-hidden [&>*]:rounded-xl">
		<a href="https://tiktok.com/@d_ana___">
			<TikTok color="#000" width={40} height={40} />
		</a>
		<a href="https://www.instagram.com/__d_ana___">
			<Instagram color="#000" width={40} height={40} />
		</a>
	</div>
</header>
