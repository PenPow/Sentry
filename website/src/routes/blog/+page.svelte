<script lang="ts">
	import type { PageData } from './$types';
	import BlogPosts from '$lib/components/BlogPosts.svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	export let data: PageData;

	const posts = data.posts ?? [];
</script>

<Navbar />
<BlogPosts {posts} />
