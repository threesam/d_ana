<script lang="ts">
	import titleFace from '@fontsource/poiret-one/files/poiret-one-latin-400-normal.woff2?url'
	import { page } from '$app/state'
	import type { LayoutProps } from './$types'
	import './styles.css'

	let { data, children }: LayoutProps = $props()

	// the page a reader is on is marked in the lists at the foot
	const here = (path: string) => (page.url.pathname === path ? 'page' : undefined)
</script>

<svelte:head>
	<!-- the title face is the first thing drawn on every page: fetch it with the page -->
	<link rel="preload" href={titleFace} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<a class="skip mono" href="#main">Skip to content</a>

<header class="wrap mast" data-via="top">
	<a class="mark" href="/">d-ana</a>
	<nav class="mono" aria-label="Site">
		<a href="/#themes">Themes</a>
		<a href="/places">Places</a>
	</nav>
</header>

<main id="main" tabindex="-1">
	{@render children()}
</main>

<footer class="wrap mono muted" data-via="foot" data-seen="end">
	<!-- every year and every theme, at the foot of every page: no page is a dead end -->
	{#if data.index.years.length > 0}
		<nav aria-label="All years">
			{#each data.index.years as year (year)}
				<a href="/{year}" aria-current={here(`/${String(year)}`)}>{year}</a>
			{/each}
		</nav>
	{/if}
	{#if data.index.themes.length > 0}
		<nav aria-label="All themes">
			{#each data.index.themes as theme (theme.handle)}
				<a href="/theme/{theme.handle}" aria-current={here(`/theme/${theme.handle}`)}
					>{theme.title}</a
				>
			{/each}
		</nav>
	{/if}
	<div class="line">
		<span>d-ana</span>
		<span>Photographs and words, kept in one place.</span>
		<!-- where else she is: the two links her site has always carried -->
		<nav aria-label="Elsewhere">
			<a href="https://www.instagram.com/__d_ana___" rel="me noopener">Instagram</a>
			<a href="https://tiktok.com/@d_ana___" rel="me noopener">TikTok</a>
		</nav>
	</div>
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
	.mast nav {
		display: flex;
		gap: 24px;
	}
	.mast nav a {
		/* tall enough for a thumb, without making the masthead any taller */
		padding-block: 8px;
		margin-block: -8px;
	}

	main {
		outline: none;
	}

	footer {
		display: grid;
		gap: 12px;
		margin-top: clamp(96px, 14vw, 200px);
		padding-block: 24px 40px;
		border-top: 1px solid var(--color-ink);
		/* The foot is drawn when a reader nears it, not with the page. Its lists are the one place
		   a Russian theme title is set in the mono face, and drawing them had every page fetch
		   that face's Cyrillic file ahead of its own first screen. Nothing stands under the foot,
		   so no place on the page depends on its height (unlike a month, where this was tried and
		   put jumps in the wrong place). */
		content-visibility: auto;
		contain-intrinsic-block-size: auto 320px;
	}
	.line {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 12px;
		margin-top: 12px;
	}
	footer nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0 24px;
	}
	footer a {
		/* tall enough for a thumb: the rows of a list that wraps stand one on the other */
		padding-block: 8px;
	}
	.line a {
		margin-block: -8px;
	}
	footer a[aria-current] {
		color: var(--color-ink);
		text-decoration-line: none;
	}
</style>
