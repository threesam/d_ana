<script lang="ts">
	import titleFace from '@fontsource/poiret-one/files/poiret-one-latin-400-normal.woff2?url'
	import type { LayoutProps } from './$types'
	import './styles.css'

	let { children }: LayoutProps = $props()
</script>

<svelte:head>
	<!-- the title face is the first thing drawn on every page: fetch it with the page -->
	<link rel="preload" href={titleFace} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<a class="skip mono" href="#main">Skip to content</a>

<header class="wrap mast" data-via="top">
	<a class="mark" href="/">d-ana</a>
	<nav class="mono" aria-label="Site">
		<a href="/places">Places</a>
	</nav>
</header>

<main id="main" tabindex="-1">
	{@render children()}
</main>

<footer class="wrap mono muted" data-seen="end">
	<span>d-ana</span>
	<span>Photographs and words, kept in one place.</span>
	<!-- where else she is: the two links her site has always carried -->
	<nav aria-label="Elsewhere" data-via="foot">
		<a href="https://www.instagram.com/__d_ana___" rel="me noopener">Instagram</a>
		<a href="https://tiktok.com/@d_ana___" rel="me noopener">TikTok</a>
	</nav>
</footer>

<style>
	.skip {
		position: absolute;
		left: -9999px;
		z-index: 1;
		padding: 8px 12px;
		background: var(--color-paper);
	}
	.skip:focus {
		left: 8px;
		top: 8px;
	}

	.mast {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 24px;
		padding-block: 20px;
	}
	.mark {
		font: 400 34px/1 var(--font-title);
		text-decoration-line: none;
	}
	.mark:hover {
		text-decoration-line: underline;
	}

	main {
		outline: none;
	}

	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 12px;
		margin-top: clamp(96px, 14vw, 200px);
		padding-block: 24px 40px;
		border-top: 1px solid var(--color-ink);
	}
	footer nav {
		display: flex;
		gap: 24px;
	}
	footer a {
		/* tall enough for a thumb */
		padding-block: 6px;
		margin-block: -6px;
	}
</style>
