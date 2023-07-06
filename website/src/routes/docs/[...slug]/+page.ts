import { error } from '@sveltejs/kit';

export async function load({ params }) {
	try {
		// Default is a svelte component but i cant be asked to type it properly
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const post: { metadata: { title: string }; default: any } = await import(
			`../../../lib/docs/${params.slug}.md`
		);

		const content = post.default;

		return { Content: content, slug: params.slug, title: post.metadata.title };
	} catch {
		console.log('error');
		throw error(404, { message: 'No Post Found' });
	}
}
