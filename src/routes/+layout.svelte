<script lang="ts">
	import Header from '$lib/components/Header.svelte'
	import type { LayoutProps } from './$types'
	import './styles.css'

	let { children }: LayoutProps = $props()
</script>

<div class="app relative min-h-screen font-sans">
	<a
		href="#main"
		class="sr-only z-20 bg-white p-2 text-dark focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
		>Skip to content</a
	>
	<Header />

	<main id="main">
		{@render children()}
	</main>

	<footer class="w-full border-t border-dark p-10 text-center text-dark">
		© d-ana 1992-{new Date().getFullYear()}
	</footer>
</div>
