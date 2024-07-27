/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';
import nextJest from 'next/jest.js';
import { baseConfig } from './jest.config';

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
	dir: './',
});

const extendedConfig: Config = {
	...baseConfig,
	testRegex: '.*\\.(llm|api)\\.test\\.ts',
	testPathIgnorePatterns: [],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(extendedConfig);
