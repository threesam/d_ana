<script>
	export let width = 20
	export let height = 20
	export let color = 'var(--textColor)'
</script>

<svg
	viewBox="0 0 15 15"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	{width}
	{height}
	style={`color: ${color}`}
>
	<path
		fill-rule="evenodd"
		clip-rule="evenodd"
		d="M8 1v11.293l3.146-3.147.708.708L7.5 14.207 3.146 9.854l.708-.708L7 12.293V1h1z"
		fill="currentColor"
	/>
</svg>
