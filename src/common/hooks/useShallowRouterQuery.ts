import { useRouter } from 'next/router';

export const useShallowRouterQuery = () => {
	const router = useRouter();
	return {
		replace: (query: object) =>
			void router.replace(
				{
					pathname: router.pathname,
					query: { ...router.query, ...query },
				},
				undefined,
				{ shallow: true },
			),
		push: (query: object) =>
			void router.push(
				{
					pathname: router.pathname,
					query: { ...router.query, ...query },
				},
				undefined,
				{ shallow: true },
			),
		pushReplaceQuery: (query: object) => {
			void router.push(
				{
					pathname: router.pathname,
					query: { ...query },
				},
				undefined,
				{ shallow: true },
			);
		},
		query: router.query,
		router,
	};
};
