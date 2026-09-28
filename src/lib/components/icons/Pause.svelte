<script lang="ts">
	interface Props {
		width?: number | undefined
		height?: number | undefined
	}

	let { width = 30, height = 30 }: Props = $props()
</script>

<svg viewBox="0 0 15 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {width} {height}
	><path
		fill-rule="evenodd"
		clip-rule="evenodd"
		d="M0 7.5a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0zM7 10H6V5h1v5zm2 0H8V5h1v5z"
	></path></svg
>
