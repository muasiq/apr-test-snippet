import { Button } from '@mui/material';
import { BottomDrawer } from '~/features/ui/layouts/BottomDrawer';
import theme from '~/styles/theme';

export type SortField = 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export type PatientSortState = {
	sortSelected: boolean;
	sortBy: {
		field: SortField;
		order: SortOrder;
	} | null;
};

type SortDrawerProps = {
	sort: PatientSortState;
	setSort: React.Dispatch<React.SetStateAction<PatientSortState>>;
};

export const SortDrawer = ({ sort, setSort }: SortDrawerProps) => {
	const handleSortChange = (field: SortField, order: SortOrder) => {
		setSort((prev) => {
			const isSortActive = prev.sortBy !== null && prev.sortBy.field === field && prev.sortBy.order === order;

			return {
				sortSelected: isSortActive ? prev.sortSelected : false,
				sortBy: isSortActive ? null : { field, order },
			};
		});
	};

	const sortOptions: { label: string; field: SortField; order: SortOrder }[] = [
		{
			label: 'Newest',
			field: 'createdAt',
			order: 'desc' as const,
		},
		{
			label: 'Oldest',
			field: 'createdAt',
			order: 'asc' as const,
		},
		{
			label: 'Last updated',
			field: 'updatedAt',
			order: 'desc' as const,
		},
		{
			label: 'First updated',
			field: 'updatedAt',
			order: 'asc' as const,
		},
	];

	return (
		<BottomDrawer
			isOpen={sort.sortSelected}
			setIsOpen={() => setSort((prev) => ({ ...prev, sortSelected: false }))}
			label="Sort by"
			noPadding
		>
			{sortOptions.map((option) => (
				<Button
					key={`${option.field}_${option.order}`}
					variant={
						sort.sortBy !== null && sort.sortBy.field === option.field && sort.sortBy.order === option.order
							? 'contained'
							: 'text'
					}
					fullWidth
					size="large"
					disableRipple
					disableFocusRipple
					disableTouchRipple
					sx={{
						borderRadius: 0,
						p: 2,
						borderBottom: `1px solid ${theme.palette.divider}`,
					}}
					onClick={() => handleSortChange(option.field, option.order)}
				>
					{option.label}
				</Button>
			))}
		</BottomDrawer>
	);
};
