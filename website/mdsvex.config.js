// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import { fileURLToPath } from 'url';
import * as path from 'path';
import remarkGfm from 'remark-gfm';
import remarkGithub from 'remark-github';
import a11yEmoji from '@fec/remark-a11y-emoji';

const dirname = path.resolve(fileURLToPath(import.meta.url), '../');

const config = defineConfig({
	extensions: ['.md', '.svx'],
	smartypants: { dashes: 'oldschool' },
	layout: { blog: path.join(dirname, './src/routes/blog/_layout.svelte') },
	remarkPlugins: [remarkGfm, [remarkGithub, { repository: 'PenPow/Sentry' }], a11yEmoji]
});

export default config;
