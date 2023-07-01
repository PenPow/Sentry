/* eslint-disable @typescript-eslint/no-var-requires */
const tailwind = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
	plugins: [
		tailwind(),
		autoprefixer(),
		purgecss({
			content: ['./**/**/*.html', './**/**/*.svelte'],
			whitelistPatterns: [/svelte-/],
			defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || []
		})
	]
};
