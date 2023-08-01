export type Post = {
	path: string;
	published: string;
	metadata: {
		title: string;
		authorName: string;
		authorIcon: string;
		date: string;
		layout: 'blog';
		excerpt: string;
	};
};
