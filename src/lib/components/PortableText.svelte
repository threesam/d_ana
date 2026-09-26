<script lang="ts">
	import { PortableText, type InputValue } from '@portabletext/svelte'

	interface Props {
		blocks?: InputValue | undefined
	}

	let { blocks = [] }: Props = $props()
</script>

<section class="portable-text mx-auto">
	<PortableText value={blocks} />
</section>
