<script lang="ts">
	import Blocks from '#lib/components/Blocks.svelte'
	import { monthLabel } from '#lib/content/index.ts'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()
</script>

<svelte:head>
	<title>{data.theme.title} | d-ana</title>
	<meta
		name="description"
		content={data.theme.description ?? `Photographs and notes by d-ana: ${data.theme.title}.`}
	/>
</svelte:head>

<section class="wrap title-page alone">
	<h1>{data.theme.title}</h1>
	{#if data.theme.description}
		<p class="lede">{data.theme.description}</p>
	{/if}
</section>

{#each data.months as month (month.month)}
	<section class="wrap month" aria-labelledby="heading-{month.month}">
		<h2 id="heading-{month.month}">
			<a href="/{month.month.slice(0, 4)}#{month.month}">{monthLabel(month.month, true)}</a>
		</h2>
		<Blocks blocks={month.blocks} />
	</section>
{/each}

<style>
	.title-page h1 {
		font-size: clamp(48px, 10vw, 144px);
		line-height: 1;
	}

	.month {
		/* a month is the full width of the screen and the column is its padding, so a photograph
		   can run off the edge and the row of months can fade out in the margins */
		max-width: none;
		padding-inline: var(--bleed);
	}
	.month h2 {
		padding-top: 20px;
		border-top: 1px solid var(--color-rule);
		font-size: clamp(32px, 4vw, 44px);
		line-height: 1.1;
	}
</style>
