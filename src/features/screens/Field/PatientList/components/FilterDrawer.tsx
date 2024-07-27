import { Button } from '@mui/material';
import { PatientStatus } from '@prisma/client';
import { Dispatch, SetStateAction } from 'react';
import { BottomDrawer } from '~/features/ui/layouts/BottomDrawer';
import theme from '~/styles/theme';
import { patientStatusEnumToText } from '../../../../../common/utils/patientStatusToText';

type Props = {
	filter: PatientFilterState;
	setFilter: Dispatch<SetStateAction<PatientFilterState>>;
};

export type PatientStatusFilter = Record<PatientStatus, boolean>;

export type PatientFilterState = {
	filterSelected: boolean;
	filters: PatientStatusFilter;
};

export const FilterDrawer = ({ filter, setFilter }: Props) => {
	const hasFiltersSelected = Object.values(filter.filters).some((value) => value);

	return (
		<BottomDrawer
			isOpen={filter.filterSelected}
			setIsOpen={() => setFilter((prev) => ({ ...prev, filterSelected: false }))}
			label="Filter by"
			noPadding
			closeButtonText={hasFiltersSelected ? 'Apply' : null}
		>
			{Object.entries(filter.filters).map(([status, checked]) => (
				<Button
					key={status}
					variant={checked ? 'contained' : 'text'}
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
					onClick={() => {
						const statusKey = status as PatientStatus;
						setFilter((prev) => ({
							...prev,
							filters: {
								...prev.filters,
								[statusKey]: !checked,
							},
						}));
					}}
				>
					{patientStatusEnumToText(status as PatientStatus)}
				</Button>
			))}
		</BottomDrawer>
	);
};
