import { FilterList, Search } from '@mui/icons-material';
import { IconButton, Stack, Typography } from '@mui/material';
import { SortIcon } from '~/features/ui/icons/SortIcon';
import theme from '~/styles/theme';

import { Dispatch, SetStateAction } from 'react';

import { PatientFilterState } from './FilterDrawer';
import { PatientSearchBox } from './PatientSearchBox';
import { PatientSortState } from './SortDrawer';

export type PatientSearchState = {
	patientName: string;
	searchSelected: boolean;
};

type Props = {
	search: PatientSearchState;
	setSearch: Dispatch<SetStateAction<PatientSearchState>>;
	filter: PatientFilterState;
	setFilter: Dispatch<SetStateAction<PatientFilterState>>;
	sort: PatientSortState;
	setSort: Dispatch<SetStateAction<PatientSortState>>;
};

export const PatientListHeader = ({ search, setFilter, setSearch, setSort, filter, sort }: Props) => {
	return (
		<>
			<Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={2}>
				<Typography variant="h4">Patient List</Typography>
				<Stack direction={'row'} spacing={1}>
					<IconButton
						data-cy="search-button"
						onClick={() => setSearch((prev) => ({ ...prev, searchSelected: !prev.searchSelected }))}
						sx={{
							bgcolor: search.searchSelected ? theme.palette.primary.main : 'transparent',
							color: search.searchSelected ? '#FFF' : theme.palette.primary.main,
							'&:hover': {
								bgcolor: search.searchSelected
									? theme.palette.primary.main
									: theme.palette.action.hover,
							},
						}}
					>
						<Search
							sx={{
								fontSize: '28px',
							}}
						/>
					</IconButton>
					<IconButton
						onClick={() => setFilter((prev) => ({ ...prev, filterSelected: !prev.filterSelected }))}
						sx={{
							bgcolor: Object.values(filter.filters).some((value) => value)
								? theme.palette.primary.main
								: 'transparent',
							color: Object.values(filter.filters).some((value) => value)
								? '#FFF'
								: theme.palette.primary.main,
							'&:hover': {
								bgcolor: Object.values(filter.filters).some((value) => value)
									? theme.palette.primary.main
									: theme.palette.action.hover,
							},
						}}
					>
						<FilterList
							sx={{
								fontSize: '28px',
							}}
						/>
					</IconButton>

					<IconButton
						data-cy="sort-button"
						onClick={() => setSort((prev) => ({ ...prev, sortSelected: !prev.sortSelected }))}
						sx={{
							bgcolor: sort.sortBy ? theme.palette.primary.main : 'transparent',
							color: sort.sortBy ? '#FFF' : theme.palette.primary.main,
							'&:hover': {
								bgcolor: sort.sortBy ? theme.palette.primary.main : theme.palette.action.hover,
							},
						}}
					>
						<SortIcon
							sx={{
								fontSize: '24px',
								m: 0.3,
							}}
						/>
					</IconButton>
				</Stack>
			</Stack>
			<PatientSearchBox search={search} setSearch={setSearch} />
		</>
	);
};
