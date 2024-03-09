<script lang="ts">
	export let blocks: any[] = []
	import { PortableText } from '@portabletext/svelte'
</script>

<section class="portable-text mx-auto">
	<PortableText value={blocks} />
</section>

<style lang="scss">
	:global {
		.portable-text {
			h1,
			h2,
			h3,
			h4,
			h5 {
				@apply font-semibold uppercase;
			}

			h1 {
				@apply text-4xl;
			}

			h2 {
				@apply text-3xl;
			}

			h3 {
				@apply text-2xl;
			}

			h4 {
				@apply text-xl;
			}

			h5 {
				@apply text-lg;
			}

			ul,
			p {
				@apply pb-5;
			}

			a {
				@apply border-b-2 border-pink-200 transition-all duration-100;

				&:hover {
					@apply border-transparent pb-1 text-pink-200;
				}
			}

			blockquote {
				@apply text-dark border-2 border-black bg-pink-200 p-5 text-sm sm:p-10 md:text-lg;
			}
		}
	}
</style>
