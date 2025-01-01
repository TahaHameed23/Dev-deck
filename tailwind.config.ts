import forms from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';
import tailwindcssMotion from 'tailwindcss-motion';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {}
	},

	plugins: [forms, tailwindcssMotion]
} as Config;
