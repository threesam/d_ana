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
			// All of the site's CSS is about 20 KB. Written into each page, it costs no extra
			// request before the first paint; as files it was four requests that blocked it.
			inlineStyleThreshold: 32_000
		})
	],
	test: {
		// Pure-logic unit tests, colocated next to the module they cover.
		// Browser/e2e stays in Playwright (tests/*.spec.ts).
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
})
