<script>
	import About from '$lib/components/About.svelte';
	import Header from '$lib/components/Header.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import { Hr } from 'flowbite-svelte';
</script>

<Navbar />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
		<Header />
		<Hr divClass="mt-12" />
		<About />
	</div>
</section>
