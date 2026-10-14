/// <reference types="vitest/config" />
import adapter from '@sveltejs/adapter-vercel'
import { sveltekit } from '@sveltejs/kit/vite'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// (tests/smoke.spec.ts fails if one is fetched as a file: an upgrade can rename them)
const FIRST_SCREEN_FACES = [
	'poiret-one-latin-400-normal.woff2',
	'spectral-latin-300-normal.woff2',
	'ibm-plex-mono-latin-400-normal.woff2'
]

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			adapter: adapter(),
			// All of the site's CSS, faces included, is under 100 KB. Written into each page, it
			// costs no extra request before the first paint; as files it was four requests that
			// blocked it.
			inlineStyleThreshold: 100_000
		})
	],
	build: {
		// The three faces every first screen uses are written into the CSS (45 KB of files, about
		// 38 KB more per page once compressed), so the first paint is drawn in them and nothing
		// is fetched or swapped. As files they raced the page. When the title face lost, a phone's largest
		// paint (a title) was counted only once it arrived. When the reading and date faces
		// arrived after the first paint, the whole of a long year was laid out a second time
		// (80 to 170 ms on a phone). Google read 98 or 99 instead of 100 for either.
		// Italics, the heavier weight and other alphabets stay files: no first screen needs them.
		// (`undefined` leaves every other file to Vite's usual rule)
		assetsInlineLimit: (file) => FIRST_SCREEN_FACES.some((face) => file.endsWith(face)) || undefined
	},
	test: {
		// Pure-logic unit tests, colocated next to the module they cover.
		// Browser/e2e stays in Playwright (tests/*.spec.ts).
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
})
