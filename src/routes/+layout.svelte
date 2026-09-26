<script lang="ts">
	import Header from '$lib/components/Header.svelte'
	import type { LayoutProps } from './$types'
	import './styles.css'

	let { children }: LayoutProps = $props()
</script>

<div class="app relative min-h-screen font-sans">
	<Header />

	<main>
		{@render children()}
	</main>

	<footer class="w-full border-t border-dark p-10 text-center text-dark">
		© d-ana 1992-{new Date().getFullYear()}
	</footer>
</div>
