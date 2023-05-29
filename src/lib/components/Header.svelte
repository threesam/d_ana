<script>
	import { onDestroy, onMount } from 'svelte';
	import TikTok from './icons/TikTok.svelte';

	let characters = ['I', '_', 'E', '-'];

	$: index = 0;
	$: character = '_';

	let interval;
	onMount(() => {
		interval = setInterval(() => {
			character = characters[index % characters.length];
			index++;
		}, 2000);
	});

	onDestroy(() => clearInterval(interval));
</script>

<header class="flex w-full justify-between p-10">
	<button
		class="corner bold text-4xl tracking-widest"
		on:click={() => {
			clearInterval(interval);
			character = '-';
		}}
	>
		D<span class="inline-block w-7 text-center">{character}</span>ANA
	</button>

	<a href="https://tiktok.com/@d_ana___">
		<TikTok color="#000" width={40} height={40} />
	</a>
</header>
