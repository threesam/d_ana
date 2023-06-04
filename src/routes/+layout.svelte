<script>
	import Header from '../lib/components/Header.svelte';
	import './styles.css';

	export let data;
</script>

<div class="app min-h-screen font-sans">
	<Header />

	<main>
		<slot />
	</main>

	<footer class="w-full border-t border-dark p-10 text-center text-dark">
		© d-ana 1992-{new Date().getFullYear()}
	</footer>
</div>
