<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { Hr } from 'flowbite-svelte';
	import type { PageData } from '../[slug]/$types';

	export let data: PageData;

	const { Content, metadata } = data;
</script>

<!-- <svelte:head>
	<meta property="og:title" content="{title}"/>
	<meta property="og:type" content="article"/>
	<meta property="og:description" content="{description}"/>
	<meta property="og:image" content="{cover.startsWith("http") ? cover : `https://www.penpow.dev/img/${cover}`}"/>
	<meta property="og:image:type" content="image/webp"/>
	<meta property="og:image:alt" content="{title}"/>
	<meta property="og:url" content="{$page.url.href}"/>
</svelte:head> -->

<div class="bg-white px-6 py-32 lg:px:8">
	<div class="mx-auto max-w-3xl text-base leading-7 text-gray-900">
		<div class="relative mb-4 flex items-center gap-x-4">
			<img src={metadata.authorIcon} alt="" class="h-8 w-8 rounded-sm bg-gray-50" />
			<div class="text-base leading-8">
				<p class="font-semibold text-blurple-50">
					<span class="absolute inset-0" />
					{metadata.authorName}
				</p>
			</div>
		</div>
		<h1 class="mt-2 text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl">
			{metadata.title}
		</h1>
		<p class="mt-6 text-xl leading-8 max-w-2xl">
			{metadata.excerpt}
		</p>
		<Hr divClass="mt-12" />
		<div class="mt-10 max-w-2xl prose prose-img:rounded-md text-gray-900 prose-a:text-blue-600">
			<svelte:component this={Content} />
		</div>
	</div>
</div>
