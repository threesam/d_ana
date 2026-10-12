<script lang="ts">
	import type { LayoutProps } from './$types'
	import './styles.css'

	let { children }: LayoutProps = $props()
</script>

<a class="skip mono" href="#main">Skip to content</a>

<header class="wrap mast">
	<a class="mark" href="/">d-ana</a>
	<nav class="mono" aria-label="Site">
		<a href="/places">Places</a>
	</nav>
</header>

<main id="main" tabindex="-1">
	{@render children()}
</main>

<footer class="wrap mono muted">
	<span>d-ana</span>
	<span>Photographs and words, kept in one place.</span>
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
		font: italic 400 24px/1 var(--font-title);
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
</style>
