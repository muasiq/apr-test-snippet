import { env } from '~/env.mjs';

export const shouldMockAnthropic = env.ANTHROPIC_API_KEY === 'localhost';
