<script>
	export let width = 30
	export let height = 30
	export let color = '#000000'
</script>

<svg
	viewBox="0 0 15 15"
	fill={color}
	xmlns="http://www.w3.org/2000/svg"
	{width}
	{height}
	class="transition duration-300 hover:text-primary"
>
	<path d="M7.5 5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" fill="currentColor" />
	<path
		fill-rule="evenodd"
		clip-rule="evenodd"
		d="M4.5 0A4.5 4.5 0 000 4.5v6A4.5 4.5 0 004.5 15h6a4.5 4.5 0 004.5-4.5v-6A4.5 4.5 0 0010.5
		0h-6zM4 7.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0zM11 4h1V3h-1v1z"
		fill="currentColor"
	/>
</svg>
