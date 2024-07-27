/* eslint-disable @typescript-eslint/naming-convention */

/** @type {import("eslint").Linter.Config} */
const config = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: true,
	},
	env: {
		browser: true,
		node: true,
		jest: true,
		es2021: true,
	},
	plugins: ['@typescript-eslint'],
	extends: [
		'next/core-web-vitals',
		'plugin:@typescript-eslint/recommended-type-checked',
		'plugin:@typescript-eslint/stylistic-type-checked',
	],
	ignorePatterns: ['/scripts/setup.js', '/scripts/vercel-env-upload.js', '/scripts/prod-env.js'],
	rules: {
		// These opinionated rules are enabled in stylistic-type-checked above.
		// Feel free to reconfigure them to your own preference.
		'@typescript-eslint/array-type': 'off',
		'@typescript-eslint/consistent-type-definitions': 'off',

		'@typescript-eslint/consistent-type-imports': ['off'],
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		'@typescript-eslint/no-misused-promises': [
			'error',
			{
				checksVoidReturn: false,
			},
		],
		'@typescript-eslint/naming-convention': [
			'error',
			{
				selector: 'interface',
				format: ['PascalCase'],
			},
			{
				selector: 'typeAlias',
				format: ['PascalCase'],
			},
			{
				selector: 'enum',
				format: ['PascalCase'],
			},
			{
				selector: 'typeParameter',
				format: ['PascalCase'],
			},
			{
				selector: 'enumMember',
				format: ['UPPER_CASE'],
			},
		],
	},
	overrides: [
		{
			files: ['cypress/**/*.ts'],
			parserOptions: {
				project: ['./cypress/tsconfig.json'], // Path to your Cypress tsconfig
			},
			// You can add or override rules specifically for Cypress here
		},
	],
};

module.exports = config;
