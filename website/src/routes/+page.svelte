<script lang="ts">
	import About from '$lib/components/About.svelte';
	import BlogPosts from '$lib/components/BlogPosts.svelte';
	import Header from '$lib/components/Header.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import { Hr } from 'flowbite-svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
		<Header />
		<Hr divClass="mt-12" />
		<About />
		<div class="text-left mt-8">
			<BlogPosts posts={data.posts} />
		</div>
	</div>
</section>
