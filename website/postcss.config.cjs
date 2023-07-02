/* eslint-disable @typescript-eslint/no-var-requires */
const tailwind = require('tailwindcss');
const autoprefixer = require('autoprefixer');

module.exports = {
	plugins: [
		tailwind(),
		autoprefixer(),
	]
};
