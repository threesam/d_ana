<script lang="ts">
	import { DefaultBlock, type BlockComponentProps } from '@portabletext/svelte'
	import type { Snippet } from 'svelte'

	// Same props as the library's DefaultBlock, so they pass straight through.
	interface Props {
		portableText: BlockComponentProps
		children?: Snippet
	}

	let props: Props = $props()
</script>

<!-- The bio's h3 blocks sit directly under the page h1: render them as h2 so the
     outline doesn't skip a level, styled as h3 (.pt-h3 in styles.css). -->
{#if props.portableText.value.style === 'h3'}
	<h2 class="pt-h3">{@render props.children?.()}</h2>
{:else}
	<DefaultBlock {...props} />
{/if}
