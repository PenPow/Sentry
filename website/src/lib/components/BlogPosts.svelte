<script lang="ts">
	import type { Post } from '$lib/types/Blog';
	import { Hr } from 'flowbite-svelte';

	export let posts: Post[];
</script>

<div class="bg-white">
	<div class="mx-auto mt-5 max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl lg:mx-0">
			<h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Blog</h2>
			<p class="mt-2 text-lg leading-8 text-gray-600">
				Check out the latest posts and updates we have about Sentry
			</p>
		</div>
		<Hr divClass="mt-12" />
		<div
			class="mx-auto mt-4 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 pt-4 sm:mt-8 sm:pt-8 lg:mx-0 lg:max-w-none lg:grid-cols-3"
		>
			{#each posts as post}
				<article class="flex max-w-xl flex-col items-start justify-between">
					<div class="flex items-center gap-x-4 text-xs">
						<time datetime={post.metadata.date} class="text-gray-500">{post.published}</time>
					</div>
					<div class="group relative">
						<h3
							class="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600"
						>
							<a href="/blog/{post.path}">
								<span class="absolute inset-0" />
								{post.metadata.title}
							</a>
						</h3>
						<p class="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
							{post.metadata.excerpt}
						</p>
					</div>
					<div class="relative mt-8 flex items-center gap-x-4">
						<img src={post.metadata.authorIcon} alt="" class="h-8 w-8 rounded-md bg-gray-50" />
						<div class="text-sm leading-6">
							<p class="font-semibold text-gray-900">
								<span class="absolute inset-0" />
								{post.metadata.authorName}
							</p>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</div>
</div>
