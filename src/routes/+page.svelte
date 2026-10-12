<script lang="ts">
	import Photo from '#lib/components/Photo.svelte'
	import { sizes } from '#lib/content/image.ts'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	const from = $derived(data.years.at(-1)?.year)
	const to = $derived(data.years[0]?.year)
</script>

<svelte:head>
	<title>d-ana</title>
	<meta name="description" content="Photographs and notes by d-ana, kept year by year." />
</svelte:head>

<section class="wrap title-page">
	<h1>d-ana</h1>
	{#if from !== undefined && to !== undefined}
		<p class="lede">Photographs and notes, {from} to {to}.</p>
	{/if}
</section>

<section class="wrap" aria-labelledby="years-heading">
	<h2 id="years-heading" class="sr-only">Years</h2>
	{#if data.years.length === 0}
		<p>Nothing is here yet.</p>
	{/if}
	<ol class="years">
		{#each data.years as year, i (year.year)}
			<li>
				<a class="year" href="/{year.year}">
					<span class="numeral">{year.year}</span>
					<span class="mono muted count">{year.count} {year.count === 1 ? 'piece' : 'pieces'}</span>
					{#if year.intro}
						<span class="intro">{year.intro}</span>
					{/if}
					<span class="strip">
						{#each year.frames as frame (frame.key)}
							<Photo image={frame} sizes={sizes('strip', frame)} small eager={i === 0} decorative />
						{/each}
					</span>
				</a>
			</li>
		{/each}
	</ol>
</section>

{#if data.themes.length > 0}
	<section class="wrap themes" aria-labelledby="themes-heading">
		<h2 id="themes-heading">Themes</h2>
		<ul>
			{#each data.themes as theme (theme.handle)}
				<li>
					<a href="/theme/{theme.handle}">{theme.title}</a>
					<span class="mono muted">{theme.count}</span>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.year {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: 24px;
		row-gap: 8px;
		align-items: end;
		padding-block: 36px;
		border-top: 1px solid var(--color-rule);
		text-decoration-line: none;
	}
	.years li:first-child .year {
		border-top-color: var(--color-ink);
	}
	.numeral {
		grid-column: 1 / span 4;
		font: 400 clamp(56px, 8vw, 120px) / 0.9 var(--font-title);
		letter-spacing: -0.01em;
	}
	.year:hover .numeral {
		text-decoration: underline 2px;
		text-underline-offset: 8px;
	}
	.count {
		grid-column: 1 / span 4;
	}
	.intro {
		grid-column: 1 / span 4;
		max-width: 36ch;
		font-size: 17px;
		line-height: 1.5;
	}
	.strip {
		grid-column: 5 / -1;
		grid-row: 1 / span 3;
		display: flex;
		justify-content: flex-end;
		align-items: flex-end;
		gap: 12px;
		min-width: 0;
	}
	.strip :global(img) {
		width: auto;
		height: clamp(96px, 13vw, 184px);
		min-width: 0;
		object-fit: cover;
	}

	.themes {
		margin-top: clamp(72px, 10vw, 144px);
	}
	.themes h2 {
		font-size: clamp(32px, 4vw, 44px);
		line-height: 1.1;
	}
	.themes ul {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 36px;
		margin-top: 20px;
		max-width: 1000px;
	}
	.themes a {
		font: 400 clamp(24px, 3vw, 36px) / 1.2 var(--font-title);
	}

	@media (max-width: 859px) {
		.year {
			column-gap: 12px;
			padding-block: 28px;
		}
		.numeral,
		.count,
		.intro {
			grid-column: 1 / -1;
		}
		.strip {
			grid-column: 1 / -1;
			grid-row: auto;
			justify-content: flex-start;
			margin-top: 12px;
		}
	}
</style>
