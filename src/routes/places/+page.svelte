<script lang="ts">
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()
</script>

<svelte:head>
	<title>Places | d-ana</title>
	<meta name="description" content="Where the photographs on d-ana were made." />
</svelte:head>

<section class="wrap heading">
	<h1>Places</h1>
</section>

<section class="wrap">
	{#if data.dots.length === 0}
		<p>No places yet.</p>
	{:else}
		<svg
			viewBox="0 0 {data.frame.width} {data.frame.height}"
			role="img"
			aria-labelledby="map-title"
		>
			<title id="map-title"
				>A map with one dot for each of {data.dots.length} places where the photographs were made</title
			>
			{#each data.dots as dot (`${String(dot.x)},${String(dot.y)}`)}
				<circle cx={dot.x} cy={dot.y} r={dot.r} />
				{#if dot.label}
					<text x={dot.x + dot.r + 6} y={dot.y + 4} aria-hidden="true">{dot.city}</text>
				{/if}
			{/each}
		</svg>

		<ul class="mono cities">
			{#each data.cities as city (city.city)}
				<li>{city.city} <span class="muted">{city.count}</span></li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.heading {
		padding-block: clamp(40px, 8vw, 96px) 32px;
	}
	.heading h1 {
		font-size: clamp(48px, 8vw, 112px);
		line-height: 1;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
		border-block: 1px solid var(--color-rule);
	}
	circle {
		fill: var(--color-ink);
	}
	text {
		fill: var(--color-graphite);
		font: 400 12px var(--font-mono);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.cities {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 6px 24px;
		margin-top: 32px;
	}

	/* the drawing shrinks with the screen and its labels with it: below this they are too small
	   to read, and the list under the map says the same thing */
	@media (max-width: 859px) {
		text {
			display: none;
		}
	}
</style>
