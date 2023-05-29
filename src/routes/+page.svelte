<script>
	import face from '$lib/assets/images/face.jpg';
	import SEO from 'svelte-seo';
</script>

<SEO
	title="D-ANA"
	description={'The skinny on D'}
	openGraph={{
		title: 'D-ANA',
		description: 'The skinny on D',
		type: 'website',
		images: [{ url: face }]
	}}
/>

<section class="grid grid-cols-1 gap-10 pb-10 lg:grid-cols-2">
	<img src={face} alt="d-ana's face" />
	<div class="flex flex-col gap-5 text-xl">
		<h1 class="text-5xl">I'm D.</h1>
		<p>
			Irure irure sit nulla aliquip. Incididunt irure amet aute anim cillum laborum qui occaecat non
			nisi ex veniam tempor nostrud. Ad incididunt consequat esse veniam laboris commodo amet
			adipisicing cupidatat. Aliquip voluptate ullamco labore veniam incididunt ipsum in do eu ea
			est duis. Excepteur deserunt laboris reprehenderit cupidatat. Commodo Lorem esse exercitation
			non Lorem esse cupidatat ut sunt ea sunt. Culpa id magna sint qui incididunt ad nostrud irure
			ipsum anim anim aliquip nisi ipsum.
		</p>
		<p>
			Irure irure sit nulla aliquip. Incididunt irure amet aute anim cillum laborum qui occaecat non
			nisi ex veniam tempor nostrud. Ad incididunt consequat esse veniam laboris commodo amet
			adipisicing cupidatat. Aliquip voluptate ullamco labore veniam incididunt ipsum in do eu ea
			est duis. Excepteur deserunt laboris reprehenderit cupidatat. Commodo Lorem esse exercitation
			non Lorem esse cupidatat ut sunt ea sunt. Culpa id magna sint qui incididunt ad nostrud irure
			ipsum anim anim aliquip nisi ipsum.
		</p>
		<p>
			Irure irure sit nulla aliquip. Incididunt irure amet aute anim cillum laborum qui occaecat non
			nisi ex veniam tempor nostrud. Ad incididunt consequat esse veniam laboris commodo amet
			adipisicing cupidatat. Aliquip voluptate ullamco labore veniam incididunt ipsum in do eu ea
			est duis. Excepteur deserunt laboris reprehenderit cupidatat. Commodo Lorem esse exercitation
			non Lorem esse cupidatat ut sunt ea sunt. Culpa id magna sint qui incididunt ad nostrud irure
			ipsum anim anim aliquip nisi ipsum.
		</p>
	</div>
</section>
