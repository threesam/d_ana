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

<section class="wrap title-page">
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

{#each data.months as month, i (month.month)}
	<section class="wrap month" id={month.month} aria-labelledby="heading-{month.month}">
		<h2 id="heading-{month.month}">{monthLabel(month.month)}</h2>
		<Blocks blocks={month.blocks} eager={i === 0} />
	</section>
{/each}

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
		/* a year can hold hundreds of photographs: only lay out the months near the screen */
		content-visibility: auto;
		contain-intrinsic-size: auto 2400px;
		/* skipping off-screen months also clips each month to its own box, so the box is the full
		   width of the screen and the column is its padding: a photograph can run off the edge */
		max-width: none;
		padding-inline: var(--bleed);
		scroll-margin-top: 24px;
	}
	.month h2 {
		padding-top: 20px;
		border-top: 1px solid var(--color-rule);
		font-size: clamp(32px, 4vw, 44px);
		line-height: 1.1;
	}

	.pager {
		display: flex;
		justify-content: space-between;
		gap: 24px;
		margin-top: clamp(72px, 10vw, 144px);
	}
</style>
