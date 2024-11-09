/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
	  extend: {
		colors: {
		  'dark-gray': '#1c1c1c',
		  "bluee" : "rgb(79 70 229)", // Agrega tu color personalizado aquí
		},
	  },
	},
	plugins: [],
  }
  