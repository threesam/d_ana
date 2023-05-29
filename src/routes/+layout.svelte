<script>
	import Header from '../lib/components/Header.svelte';
	import './styles.css';
</script>

<div class="app min-h-screen font-sans">
	<Header />

	<main class="px-10">
		<slot />
	</main>

	<footer>
		<p class="w-full border-t-2 border-pink-200 bg-black/70 p-5 text-center text-light">
			© d-ana 1992-{new Date().getFullYear()}
		</p>
	</footer>
</div>
