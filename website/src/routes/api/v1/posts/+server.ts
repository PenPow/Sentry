import type { Post } from '$lib/types/Blog';
import { formatDate } from '$lib/utils/dates';
import { error, json } from '@sveltejs/kit';

export const GET = async () => {
	const files = import.meta.glob('../../../../lib/blog/*.{svx,md}');

	const posts: Post[] = [];

	for (const [path, loadFile] of Object.entries(files)) {
		const { metadata } = (await loadFile()) as Post;

		posts.push({ metadata, path: path.slice(21, -3), published: formatDate(metadata.date) });
	}

	posts.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());

	if (!posts.length) {
		return error(404, 'no posts found');
	}

	return json(posts);
};
