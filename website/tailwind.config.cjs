/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
	],

	theme: {
		extend: {
			colors: {
				blurple: {
					50: '#5865f2',
					100: '#4856f0'
					// 200: '#5865f2',
					// 300: '#5865f2',
					// 400: '#5865f2',
					// 500: '#5865f2',
					// 600: '#5865f2',
					// 700: '#5865f2',
					// 800: '#5865f2',
					// 900: '#5865f2'
				}
			}
		}
	},

	darkMode: 'class',

	plugins: [require('flowbite/plugin')]
};
