import type { Post } from '$lib/types/Blog';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	try {
		// Default is a svelte component but i cant be asked to type it properly
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const post: Post & { default: any } = await import(`../../../lib/blog/${params.slug}.md`);

		const content = post.default;

		return { Content: content, metadata: post.metadata };
	} catch {
		throw error(404, { message: 'No Post Found' });
	}
}
