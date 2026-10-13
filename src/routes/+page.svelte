<script lang="ts">
	import Head from '#lib/components/Head.svelte'
	import Photo from '#lib/components/Photo.svelte'
	import { sizes } from '#lib/content/image.ts'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	const from = $derived(data.years.at(-1)?.year)
	const to = $derived(data.years[0]?.year)
</script>

<Head
	title="d-ana"
	description="Photographs and notes by d-ana, kept year by year."
	cover={data.years[0]?.frames[0]}
/>

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
	<ol class="years" data-via="years">
		{#each data.years as year (year.year)}
			<li>
				<a class="year" href="/{year.year}">
					<span class="numeral">{year.year}</span>
					<span class="mono muted count">{year.count} {year.count === 1 ? 'piece' : 'pieces'}</span>
					{#if year.intro}
						<span class="intro">{year.intro}</span>
					{/if}
					<span class="strip">
						{#each year.frames as frame (frame.key)}
							<Photo image={frame} sizes={sizes('strip', frame)} small decorative />
						{/each}
					</span>
				</a>
			</li>
		{/each}
	</ol>
</section>

{#if data.themes.length > 0}
	<section
		class="wrap themes"
		id="themes"
		aria-labelledby="themes-heading"
		data-via="themes"
		data-seen="themes"
	>
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
		/* The frames beside a year are grey until that year is pointed at, pressed, or reached
		   with the Tab key (Sam, 2026-10-11): the page is type first, and one year has colour. */
		filter: grayscale(1);
		transition: filter 0.3s;
	}
	.year:is(:hover, :focus-visible, :active) .strip {
		filter: none;
	}
	/* Nothing hovers on a phone, so there the year passing the middle of the screen is the one
	   in colour. A browser that cannot tie a style to the scroll keeps them grey until pressed. */
	@media (hover: none) {
		@supports (animation-timeline: view()) {
			.strip {
				animation: lit linear both;
				animation-timeline: view();
			}
		}
	}
	@keyframes lit {
		0%,
		25%,
		75%,
		100% {
			filter: grayscale(1);
		}
		35%,
		65% {
			filter: none;
		}
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
