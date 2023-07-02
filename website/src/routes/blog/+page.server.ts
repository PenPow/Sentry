import type { Post } from '$lib/types/Blog';

export async function load({ fetch }) {
	const posts = await fetch('/api/v1/posts');

	return { posts: await posts.json() } as { posts: Post[] };
}
