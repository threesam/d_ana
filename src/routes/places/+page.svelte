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
		<!-- A pin board: a paper cut-out of the world on cork, one pin for each place. -->
		<svg
			class="board"
			viewBox="0 0 {data.frame.width} {data.frame.height}"
			role="img"
			aria-labelledby="map-title"
		>
			<title id="map-title"
				>A world map on a cork board with a pin in each of {data.dots.length} places where the photographs
				were made</title
			>
			<defs>
				<filter id="cork-grain" x="0" y="0" width="100%" height="100%">
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="11" />
					<feColorMatrix
						values="0 0 0 0 0.36
						        0 0 0 0 0.24
						        0 0 0 0 0.12
						        0 0 0 -2.2 1.25"
					/>
				</filter>
				<filter id="lift" x="-10%" y="-10%" width="120%" height="130%">
					<feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-opacity="0.28" />
				</filter>
			</defs>

			<rect class="cork" width={data.frame.width} height={data.frame.height} />
			<rect width={data.frame.width} height={data.frame.height} filter="url(#cork-grain)" />
			<path class="land" d={data.land} filter="url(#lift)" />
			<path class="borders" d={data.borders} />

			{#each data.dots as dot (`${String(dot.x)},${String(dot.y)}`)}
				<ellipse class="shade" cx={dot.x + 1.5} cy={dot.y + 2.5} rx={dot.r} ry={dot.r * 0.8} />
				<circle class="pin" cx={dot.x} cy={dot.y} r={dot.r} />
				<circle class="glint" cx={dot.x - dot.r / 3} cy={dot.y - dot.r / 3} r={dot.r / 3.5} />
			{/each}
			{#each data.dots as dot (`${String(dot.x)},${String(dot.y)}`)}
				{#if dot.label}
					<text
						x={dot.anchor === 'end' ? dot.x - dot.r - 6 : dot.x + dot.r + 6}
						y={dot.y + 4}
						text-anchor={dot.anchor}
						aria-hidden="true">{dot.city}</text
					>
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

	/* The one place the site carries a colour of its own: the board is cork, on purpose. */
	.board {
		--cork: #c8a478;
		--frame: #7a5a36;
		display: block;
		width: 100%;
		height: auto;
		border: clamp(6px, 1vw, 12px) solid var(--frame);
		box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.25);
	}
	.cork {
		fill: var(--cork);
	}
	.land {
		fill: var(--color-paper);
	}
	.borders {
		fill: none;
		stroke: var(--color-graphite);
		stroke-width: 0.5;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
	}
	.shade {
		fill: rgb(0 0 0 / 0.3);
	}
	.pin {
		fill: var(--color-ink);
	}
	.glint {
		fill: rgb(255 255 255 / 0.7);
	}
	text {
		fill: var(--color-ink);
		font: 400 12px var(--font-mono);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		/* a paper halo, like a typed label stuck beside the pin */
		stroke: var(--color-paper);
		stroke-width: 5;
		stroke-linejoin: round;
		paint-order: stroke;
	}

	.cities {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 6px 24px;
		margin-top: 32px;
	}

	/* the board shrinks with the screen and its labels with it: below this they are too small
	   to read, and the list under the board says the same thing */
	@media (max-width: 859px) {
		text {
			display: none;
		}
	}
</style>
