import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {
		DATABASE_URL: z.string().min(1),
		NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
		NEXTAUTH_SECRET: process.env.NODE_ENV === 'production' ? z.string().min(1) : z.string().min(1).optional(),
		NEXTAUTH_URL: z.preprocess(
			// This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
			// Since NextAuth.js automatically uses the VERCEL_URL if present.
			(str) => process.env.VERCEL_URL ?? str,
			// VERCEL_URL doesn't include `https` so it cant be validated as a URL
			process.env.VERCEL ? z.string() : z.string().url(),
		),
		// Add `.min(1) on ID and SECRET if you want to make sure they're not empty
		GOOGLE_CLOUD_PROJECT_ID: z.string().min(1),
		GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT: z.string().min(1),
		GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT_KEY: z.string().min(1),
		GOOGLE_CLOUD_STORAGE_BUCKET: z.string().min(1),
		GOOGLE_CLOUD_STORAGE_ENDPOINT: z.string().optional(),

		GOOGLE_CLOUD_SPEECH_PROJECT_ID: z.string().min(1),
		GOOGLE_CLOUD_SPEECH_SERVICE_ACCOUNT: z.string().min(1),
		GOOGLE_CLOUD_SPEECH_SERVICE_ACCOUNT_KEY: z.string().min(1),

		SENDGRID_API_KEY: z.string().min(1),
		ANTHROPIC_API_KEY: z.string().min(1),
		FDB_API_CLIENT_ID: z.string().min(1).optional(),
		FDB_API_SECRET_KEY: z.string().min(1).optional(),

		// RPA KEYS
		RPA_ACCESS_KEY: z.string().min(1),
		RPA_SECRET_KEY: z.string().min(1),

		APRICOT_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
		GOOGLE_CLOUD_SHEETS_SERVICE_ACCOUNT_KEY: z.string().optional(),

		PRISMA_FIELD_ENCRYPTION_KEY: z.string().min(1),
		INNGEST_SIGNING_KEY: z.string().optional(),
		INNGEST_EVENT_KEY: z.string().optional(),
		INNGEST_DEV: z.string().optional(),
	},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {
		NEXT_PUBLIC_MUI_PRO_LICENSE_KEY: z.string().min(1),
		NEXT_PUBLIC_APRICOT_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
		NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1),
	},

	/**
	 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
	 * middlewares) or client-side so we need to destruct manually.
	 */
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		NEXT_PUBLIC_MUI_PRO_LICENSE_KEY: process.env.NEXT_PUBLIC_MUI_PRO_LICENSE_KEY,
		GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
		GOOGLE_CLOUD_STORAGE_BUCKET: process.env.GOOGLE_CLOUD_STORAGE_BUCKET,
		GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT: process.env.GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT,
		GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT_KEY: process.env.GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT_KEY,
		GOOGLE_CLOUD_STORAGE_ENDPOINT: process.env.GOOGLE_CLOUD_STORAGE_ENDPOINT,
		GOOGLE_CLOUD_SPEECH_PROJECT_ID: process.env.GOOGLE_CLOUD_SPEECH_PROJECT_ID,
		GOOGLE_CLOUD_SPEECH_SERVICE_ACCOUNT: process.env.GOOGLE_CLOUD_SPEECH_SERVICE_ACCOUNT,
		GOOGLE_CLOUD_SPEECH_SERVICE_ACCOUNT_KEY: process.env.GOOGLE_CLOUD_SPEECH_SERVICE_ACCOUNT_KEY,
		SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
		ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
		FDB_API_CLIENT_ID: process.env.FDB_API_CLIENT_ID,
		FDB_API_SECRET_KEY: process.env.FDB_API_SECRET_KEY,
		RPA_ACCESS_KEY: process.env.RPA_ACCESS_KEY,
		RPA_SECRET_KEY: process.env.RPA_SECRET_KEY,
		APRICOT_ENV: process.env.APRICOT_ENV,
		NEXT_PUBLIC_APRICOT_ENV: process.env.NEXT_PUBLIC_APRICOT_ENV,
		GOOGLE_CLOUD_SHEETS_SERVICE_ACCOUNT_KEY: process.env.GOOGLE_CLOUD_SHEETS_SERVICE_ACCOUNT_KEY,
		NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
		PRISMA_FIELD_ENCRYPTION_KEY: process.env.PRISMA_FIELD_ENCRYPTION_KEY,
		INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
		INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
		INNGEST_DEV: process.env.INNGEST_DEV,
	},
	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
	 * useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
