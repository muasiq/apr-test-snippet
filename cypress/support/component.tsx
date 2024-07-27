// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

import { CssBaseline, ThemeProvider } from '@mui/material';
import { httpBatchLink } from '@trpc/client';
import { MountOptions, mount } from 'cypress/react18';
import { SessionProvider } from 'next-auth/react';
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider/next-13.5';
import superjson from 'superjson';
import { AlertProvider } from '~/common/providers/AlertProvider';
import { trpcReact } from '~/common/utils/api';
import theme from '~/styles/theme';

type TRPCClient = ReturnType<typeof trpcReact.createClient>;

function RenderWithProviders({
	queryClient,
	trpcClient,
	children,
}: {
	queryClient: QueryClient;
	trpcClient: TRPCClient;
	children: React.ReactNode;
}) {
	return (
		<SessionProvider session={null} refetchWhenOffline={false}>
			<ThemeProvider theme={theme}>
				<AlertProvider verticalPosition="top" horizontalPosition="center">
					<CssBaseline />
					<trpcReact.Provider client={trpcClient} queryClient={queryClient}>
						<QueryClientProvider client={queryClient}>
							<MemoryRouterProvider url={'/'}>{children}</MemoryRouterProvider>
						</QueryClientProvider>
					</trpcReact.Provider>
				</AlertProvider>
			</ThemeProvider>
		</SessionProvider>
	);
}

function nextMount(children: JSX.Element, options?: Partial<MountOptions> | undefined) {
	const url = `http://localhost:${process.env.PORT ?? 3000}/api/trpc`;

	const queryClient = new QueryClient({
		defaultOptions: { queries: { staleTime: Infinity } },
	});

	const trpcClient = trpcReact.createClient({
		links: [httpBatchLink({ url })],
		transformer: superjson,
	});

	return mount(
		<RenderWithProviders queryClient={queryClient} trpcClient={trpcClient}>
			{children}
		</RenderWithProviders>,
		options,
	).then(({ rerender, ...props }) => {
		const rerenderWithProviders = (children: React.ReactNode) =>
			rerender(
				<RenderWithProviders queryClient={queryClient} trpcClient={trpcClient}>
					{children}
				</RenderWithProviders>,
			);

		return { rerender: rerenderWithProviders, ...props };
	});
}

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
	namespace Cypress {
		interface Chainable {
			mount: typeof mount;
			nextMount: typeof nextMount;
		}
	}
}

Cypress.Commands.add('mount', mount);

Cypress.Commands.add('nextMount', nextMount);

// Example use:
// cy.mount(<MyComponent />)
