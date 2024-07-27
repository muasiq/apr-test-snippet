import { useMemo, useState } from 'react';
import useDebounce from '~/common/hooks/useDebounce';
import { api } from '~/common/utils/api';
import { getInitialSearchFilters } from './common/util/getInitialSearchFilters';
import { FilterDrawer, PatientFilterState } from './components/FilterDrawer';
import { PatientList } from './components/PatientList';
import { PatientListHeader, PatientSearchState } from './components/PatientListHeader';
import { PatientSortState, SortDrawer } from './components/SortDrawer';

export const PatientListScreen = () => {
	const [search, setSearch] = useState<PatientSearchState>({
		patientName: '',
		searchSelected: false,
	});

	const [filter, setFilter] = useState<PatientFilterState>({
		filterSelected: false,
		filters: getInitialSearchFilters(),
	});

	const [sort, setSort] = useState<PatientSortState>({
		sortBy: null,
		sortSelected: false,
	});

	const debouncedSearchInput = useDebounce(search.patientName, 500);

	const { data, fetchNextPage, hasNextPage, isLoading } = api.patient.getInfinite.useInfiniteQuery(
		{
			limit: 25,
			name: debouncedSearchInput,
			filters: filter.filters,
			orderBy: sort.sortBy
				? {
						field: sort.sortBy.field,
						sortOrder: sort.sortBy.order,
					}
				: undefined,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		},
	);

	const patients = useMemo(() => {
		return data?.pages.flatMap((page) => page.items) ?? [];
	}, [data]);

	return (
		<>
			<PatientListHeader
				search={search}
				filter={filter}
				sort={sort}
				setFilter={setFilter}
				setSearch={setSearch}
				setSort={setSort}
			/>

			<PatientList
				data={patients}
				search={search}
				isLoading={isLoading}
				fetchNextPage={fetchNextPage}
				hasNextPage={hasNextPage}
			/>

			<FilterDrawer filter={filter} setFilter={setFilter} />

			<SortDrawer sort={sort} setSort={setSort} />
		</>
	);
};
