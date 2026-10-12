<script lang="ts">
	import type { Block, Figure } from '#lib/content/compose.ts'
	import { sizes } from '#lib/content/image.ts'
	import { dayLabel, mentions, unnamed } from '#lib/content/index.ts'
	import Photo from './Photo.svelte'

	interface Props {
		blocks: Block[]
	}

	let { blocks }: Props = $props()

	// the city, not the street: a caption says roughly where, never an address
	const where = (figure: Figure) => {
		const place = figure.piece.place
		if (place === null) return ''
		return place.city === '' ? place.name : place.city
	}
</script>

{#snippet account(handle: string, label: string)}
	<a href="https://www.instagram.com/{handle}/" rel="noopener">{label}</a>
{/snippet}

<!-- her words, with every account she named as the link to it -->
{#snippet words(text: string)}
	<p class="text">
		{#each mentions(text) as part, i (i)}{#if part.handle === null}{part.text}{:else}{@render account(
					part.handle,
					part.text
				)}{/if}{/each}
	</p>
{/snippet}

{#snippet caption(figure: Figure)}
	<p class="mono muted">
		<time datetime={figure.piece.day}>{dayLabel(figure.piece.day)}</time>{where(figure) === ''
			? ''
			: `, ${where(figure)}`}{figure.image.video === null ? '' : ', video'}
	</p>
	{#if figure.lead}
		{@const others = unnamed(figure.piece.people, figure.piece.text)}
		{#if figure.piece.text}
			{@render words(figure.piece.text)}
		{/if}
		{#if others.length > 0}
			<p class="mono muted">
				With
				{#each others as person, i (person)}
					{i > 0 ? ', ' : ''}{@render account(person.slice(1), person)}
				{/each}
			</p>
		{/if}
	{/if}
{/snippet}

{#each blocks as block, i (i)}
	{#if block.layout === 'bleed'}
		<figure class={['block', 'bleed', block.side]}>
			<Photo image={block.figure.image} sizes={sizes('bleed', block.figure.image)} />
			<figcaption>{@render caption(block.figure)}</figcaption>
		</figure>
	{:else if block.layout === 'stagger'}
		<div class={['block', 'stagger', block.drop]}>
			<figure class="a">
				<Photo image={block.a.image} sizes={sizes('first', block.a.image)} />
				<figcaption>{@render caption(block.a)}</figcaption>
			</figure>
			<figure class="b">
				<Photo image={block.b.image} sizes={sizes('second', block.b.image)} />
				<figcaption>{@render caption(block.b)}</figcaption>
			</figure>
		</div>
	{:else}
		<article class="block words">
			{#if block.piece.title}
				<h3>{block.piece.title}</h3>
			{/if}
			<p class="mono muted">
				<time datetime={block.piece.day}>{dayLabel(block.piece.day)}</time>
			</p>
			{#if block.piece.text}
				{@render words(block.piece.text)}
			{/if}
		</article>
	{/if}
{/each}

<style>
	.block {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: 24px;
		align-items: start;
		margin-block: clamp(56px, 9vw, 144px);
	}

	/* The columns and heights here are mirrored by `sizes()` in content/image.ts, which tells the
	   browser how wide each photograph is drawn. Change one, change the other. */
	/* A photograph's box is worked out from its shape (--ratio, set by Photo), never from the
	   file: with `width: auto` it was 0 by 0 until it loaded, and one run off the right edge
	   never came into view, so it never loaded at all. */
	.block :global(.photo) {
		display: block;
		width: min(100%, calc(var(--tall) * var(--ratio)));
		height: auto;
		aspect-ratio: var(--ratio);
	}

	figcaption {
		display: grid;
		gap: 10px;
		margin-top: 12px;
	}

	.text {
		max-width: 44ch;
		font-size: 17px;
		line-height: 1.55;
		white-space: pre-line;
		overflow-wrap: anywhere;
	}

	/* Bleed: one photograph runs off an edge, her words stay small at the other side. */
	.bleed {
		--tall: 92svh;
	}
	.bleed :global(.photo) {
		grid-row: 1;
	}
	.bleed figcaption {
		grid-row: 1;
		margin-top: clamp(24px, 8vw, 120px);
	}
	.bleed.right :global(.photo) {
		grid-column: 7 / -1;
		justify-self: end;
		margin-right: calc(-1 * var(--bleed));
	}
	.bleed.right figcaption {
		grid-column: 1 / span 5;
	}
	.bleed.left :global(.photo) {
		grid-column: 1 / span 6;
		justify-self: start;
		margin-left: calc(-1 * var(--bleed));
	}
	.bleed.left figcaption {
		grid-column: 8 / -1;
	}

	/* Stagger pair: two photographs, the second dropped lower. The dropped one switches sides. */
	.stagger figure {
		grid-row: 1;
	}
	.stagger {
		--tall: 82svh;
	}
	.stagger .b {
		margin-top: clamp(48px, 14vw, 220px);
	}
	.stagger.right .a {
		grid-column: 1 / span 5;
	}
	.stagger.right .b {
		grid-column: 7 / span 4;
	}
	.stagger.left .a {
		grid-column: 8 / span 5;
	}
	.stagger.left .b {
		grid-column: 3 / span 4;
	}

	/* Writing with no photograph: the words carry the page. */
	.words {
		row-gap: 16px;
		padding-top: clamp(48px, 12vw, 180px);
	}
	.words > * {
		grid-column: 2 / span 8;
	}
	.words h3 {
		font-size: clamp(34px, 6vw, 84px);
		line-height: 1.02;
	}

	/* On a phone everything is one column, set in from alternating edges. */
	@media (max-width: 859px) {
		.block {
			column-gap: 12px;
		}
		.bleed figcaption {
			grid-row: 2;
			grid-column: 1 / -1;
			margin-top: 12px;
		}
		.bleed.right :global(.photo) {
			grid-column: 3 / -1;
			margin-right: calc(-1 * var(--gutter));
		}
		.bleed.left :global(.photo) {
			grid-column: 1 / span 10;
			margin-left: calc(-1 * var(--gutter));
		}
		.bleed.right figcaption,
		.bleed.left figcaption {
			grid-column: 1 / -1;
		}
		.stagger .b {
			grid-row: 2;
			margin-top: 28px;
		}
		.stagger.right .a,
		.stagger.left .b {
			grid-column: 1 / span 9;
		}
		.stagger.right .b,
		.stagger.left .a {
			grid-column: 4 / -1;
		}
		.words > * {
			grid-column: 1 / -1;
		}
	}
</style>
