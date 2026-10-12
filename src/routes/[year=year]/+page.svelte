<script lang="ts">
	import Blocks from '#lib/components/Blocks.svelte'
	import { monthLabel } from '#lib/content/index.ts'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()
</script>

<svelte:head>
	<title>{data.year} | d-ana</title>
	<meta name="description" content="Photographs and notes by d-ana from {data.year}." />
</svelte:head>

<section class="wrap title-page alone">
	<h1>{data.year}</h1>
	{#if data.intro}
		<p class="lede">{data.intro}</p>
	{/if}
	<nav class="mono months" aria-label="Months of {data.year}">
		{#each data.months as month (month.month)}
			<a href="#{month.month}">{monthLabel(month.month)}</a>
		{/each}
	</nav>
</section>

<!-- Everything from the first month down. The row of months sticks to the top of this run. -->
<div class="run">
	<!-- The month headings again, as one row that follows the page: the month you are in stands
	     where its heading would, and the next draws nearer as you read down (the script in
	     app.html moves it). It is there for the eye and the pointer only. Screen readers and the
	     keyboard have the headings themselves and the list of months at the top of the page. -->
	<div class="ribbon" aria-hidden="true">
		<div class="window">
			<ol>
				{#each data.months as month, i (month.month)}
					<li style:--i={i}>
						<a href="#{month.month}" tabindex="-1">{monthLabel(month.month)}</a>
					</li>
				{/each}
			</ol>
		</div>
	</div>

	{#each data.months as month (month.month)}
		<section class="wrap month" id={month.month} aria-labelledby="heading-{month.month}">
			<h2 id="heading-{month.month}">{monthLabel(month.month)}</h2>
			<Blocks blocks={month.blocks} />
		</section>
	{/each}
</div>

<nav class="wrap mono pager" aria-label="Other years">
	{#if data.earlier !== null}
		<a href="/{data.earlier}">Earlier, {data.earlier}</a>
	{:else}
		<span></span>
	{/if}
	{#if data.later !== null}
		<a href="/{data.later}">Later, {data.later}</a>
	{/if}
</nav>

<style>
	.months {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 20px;
		margin-top: 28px;
	}

	.month {
		/* a month is the full width of the screen and the column is its padding, so a photograph
		   can run off the edge and the row of months can fade out in the margins */
		max-width: none;
		padding-inline: var(--bleed);
		scroll-margin-top: 24px;
	}
	.run {
		/* one size for a month's name, in its heading and in the row that stands over it */
		--month: clamp(32px, 4vw, 44px);
		/* the row's height: hairline, space above the name, the name, space under it */
		--bar: calc(1px + 20px + var(--month) * 1.1 + 12px);
	}

	/* each month opens with a hairline across the column */
	.month::before {
		content: '';
		display: block;
		border-top: 1px solid var(--color-rule);
	}
	.month h2 {
		padding-top: 20px;
		font-size: var(--month);
		line-height: 1.1;
	}

	/* Without the script the row is not there and the headings are drawn as usual. With it
	   (`live`), the row stands in for them: each heading keeps its place and its meaning and is
	   simply not drawn, and a month's name is in the same spot whichever of the two you see. */
	.ribbon {
		display: none;
	}
	.run:global(.live) .month h2 {
		opacity: 0;
	}
	.run:global(.live) .month {
		/* a jump to a month puts its heading exactly under the row */
		scroll-margin-top: 0;
	}
	.run:global(.live) .ribbon {
		display: block;
		position: sticky;
		top: 0;
		z-index: 1;
		box-sizing: border-box;
		height: var(--bar);
		/* it lies over the first month's heading, so it takes up no room of its own */
		margin-bottom: calc(-1 * var(--bar));
		background: var(--color-paper);
	}
	/* once it is stuck, photographs pass under it: a hairline marks where */
	.run:global(.stuck) .ribbon {
		border-bottom: 1px solid var(--color-rule);
	}
	.window {
		height: 100%;
		padding-inline: var(--bleed);
		overflow: clip;
		/* a name fades out as it leaves the column, on either side: softly at the edge here, and
		   as a whole by the script, which matters on a phone where the margin is 16px wide */
		mask-image: linear-gradient(
			to right,
			transparent,
			#000 var(--bleed),
			#000 calc(100% - var(--bleed)),
			transparent
		);
	}
	.window::before {
		content: '';
		display: block;
		border-top: 1px solid var(--color-rule);
	}
	.ribbon ol {
		display: flex;
		column-gap: 1em;
		width: max-content;
		padding-top: 20px;
		font: 400 var(--month) / 1.1 var(--font-title);
		white-space: nowrap;
		will-change: transform;
	}
	/* Until the row sticks, only the first name shows: it is that month's heading. Then the
	   others arrive one after another. Leaving, they go together. */
	.ribbon li {
		opacity: 0;
		transition: opacity 0.2s;
	}
	.ribbon li:first-child,
	.run:global(.stuck) .ribbon li {
		opacity: 1;
	}
	.run:global(.stuck) .ribbon li {
		transition: opacity 0.6s calc(var(--i) * 80ms);
	}
	.ribbon a {
		color: var(--color-graphite);
		text-decoration-line: none;
	}
	.ribbon a:hover {
		text-decoration-line: underline;
	}
	.ribbon li:global(.now) a {
		color: var(--color-ink);
	}
	/* A click on a month many screens away cuts most of the way there (the script says why). For
	   that moment (`hop`) the row is not tied to the page: it slides straight to the month. */
	.run:global(.hop) .ribbon ol {
		transition: transform 0.7s cubic-bezier(0.3, 0, 0.2, 1);
	}
	.run:global(.hop) .ribbon a {
		transition: opacity 0.7s;
	}
	@media (prefers-reduced-motion: reduce) {
		.ribbon li,
		.run:global(.stuck) .ribbon li {
			transition: none;
		}
	}

	.pager {
		display: flex;
		justify-content: space-between;
		gap: 24px;
		margin-top: clamp(72px, 10vw, 144px);
	}
</style>
