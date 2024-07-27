import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import { createTRPCReact } from '@trpc/react-query';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';
import { ACTIVE_ORG_SESSION_STORAGE_KEY } from '~/common/constants/constants';
import { type AppRouter } from '~/server/api/root';

const getBaseUrl = () => {
	if (typeof window !== 'undefined') return ''; // browser should use relative url
	return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

const trpcConfig = {
	config() {
		return {
			abortOnUnmount: false,
			transformer: superjson,
			links: [
				loggerLink({
					enabled: (opts) =>
						process.env.NODE_ENV === 'development' ||
						(opts.direction === 'down' && opts.result instanceof Error),

					console: {
						log: (...e) => console.log(...(e as unknown[])),
						error: (...e: unknown[]) => {
							const last = e[e.length - 1];
							if (
								process.env.NODE_ENV === 'production' &&
								last &&
								typeof last === 'object' &&
								'result' in last &&
								last.result instanceof Error
							) {
								const { result, ...rest } = last;
								console.error(result, rest);
							} else {
								console.error(...e);
							}
						},
					},
					colorMode: process.env.NODE_ENV === 'development' ? 'css' : 'ansi',
				}),
				httpBatchLink({
					headers() {
						const activeOrgId = sessionStorage?.[ACTIVE_ORG_SESSION_STORAGE_KEY] as string | undefined;
						if (activeOrgId) {
							return {
								'active-organization-id': activeOrgId,
							};
						}
						return {};
					},
					url: `${getBaseUrl()}/api/trpc`,
				}),
			],
		};
	},
	ssr: false,
};

export const api = createTRPCNext<AppRouter>(trpcConfig);
export const trpcReact = createTRPCReact<AppRouter>();

export type RouterInputs = inferRouterInputs<AppRouter>;

export type RouterOutputs = inferRouterOutputs<AppRouter>;
