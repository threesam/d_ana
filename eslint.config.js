import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import ts from 'typescript-eslint'

export default defineConfig(
	{
		ignores: [
			'build/**',
			'.svelte-kit/**',
			'.vercel/**',
			'node_modules/**',
			'static/**',
			'playwright-report/**',
			'test-results/**'
		]
	},
	js.configs.recommended,
	...ts.configs.strictTypeChecked,
	...ts.configs.stylisticTypeChecked,
	...svelte.configs['flat/recommended'],
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			},
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				tsconfigRootDir: import.meta.dirname
			}
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser,
				projectService: true,
				extraFileExtensions: ['.svelte'],
				tsconfigRootDir: import.meta.dirname
			}
		}
	},
	{
		rules: {
			// External links (TikTok, Instagram) don't go through SvelteKit's resolve().
			'svelte/no-navigation-without-resolve': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
			]
		}
	},
	{
		// {@render snippet()} compiles to a void call inside an expression; the TS rule
		// can't see Svelte template semantics and misfires on every render tag.
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		rules: {
			'@typescript-eslint/no-confusing-void-expression': 'off'
		}
	}
)
