<script lang="ts">
	import { PortableText, type InputValue, type PortableTextComponents } from '@portabletext/svelte'

	interface Props {
		blocks?: InputValue | undefined
		components?: PortableTextComponents | undefined
	}

	let { blocks = [], components = {} }: Props = $props()
</script>

<section class="portable-text mx-auto">
	<PortableText value={blocks} {components} />
</section>
