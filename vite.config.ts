/// <reference types="vitest/config" />
import adapter from '@sveltejs/adapter-vercel'
import { sveltekit } from '@sveltejs/kit/vite'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			adapter: adapter(),
			// All of the site's CSS is about 35 KB, the title face included. Written into each page,
			// it costs no extra request before the first paint; as files it was four requests that
			// blocked it.
			inlineStyleThreshold: 48_000
		})
	],
	build: {
		// The title face (8 KB) is written into the CSS, so it is there for the first paint. As a
		// file it raced the page: when it lost, the largest thing on a first screen, a title, was
		// counted as drawn only once it arrived (a phone's 99 instead of 100). The other faces
		// stay files: they are bigger and nothing on a first screen waits for them.
		// (`undefined` leaves every other file to Vite's usual rule)
		assetsInlineLimit: (file) => file.endsWith('poiret-one-latin-400-normal.woff2') || undefined
	},
	test: {
		// Pure-logic unit tests, colocated next to the module they cover.
		// Browser/e2e stays in Playwright (tests/*.spec.ts).
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
})
