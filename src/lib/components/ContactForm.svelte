<script>
	let email
	let name
	let message
</script>

<form
	name="contact"
	class="z-0 flex w-96 max-w-full flex-col gap-5 border-2 border-white bg-black p-5 transition-all
duration-300 lg:gap-10 lg:p-10"
>
	<h4 class="text-7xl tracking-widest">Contact</h4>
	<input type="hidden" name="form-name" value="contact" />
	<label for="email">
		<input
			class="placeholder:text-light w-full rounded-none border-2 border-white bg-black p-5 text-white
    focus:border-yellow-600 focus:outline-none"
			placeholder="enter email"
			bind:value={email}
			type="email"
			name="email"
			id="contact-email"
		/>
	</label>
	<label for="name">
		<input
			class="placeholder:text-light w-full rounded-none border-2 border-white bg-black p-5 text-white
    focus:border-yellow-600 focus:outline-none"
			placeholder="enter name"
			bind:value={name}
			type="name"
			name="name"
			id="contact-name"
		/>
	</label>
	<textarea
		class="placeholder:text-light w-full rounded-none border-2 border-white bg-black p-5 text-white
  focus:border-yellow-600 focus:outline-none"
		name="message"
		placeholder="enter message"
		bind:value={message}
		id="contact-message"
		cols="30"
		rows="3"
	/>
	<button class="bg-white p-5 uppercase text-black" type="submit">Submit</button>
</form>
