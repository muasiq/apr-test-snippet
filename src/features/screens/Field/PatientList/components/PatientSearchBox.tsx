import { Grow, TextField } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { primaryTextFieldStyles } from '~/features/ui/textfield/textfield.styles';
import theme from '~/styles/theme';
import { PatientSearchState } from './PatientListHeader';

type Props = {
	search: PatientSearchState;
	setSearch: Dispatch<SetStateAction<PatientSearchState>>;
};
export const PatientSearchBox = ({ search, setSearch }: Props) => {
	return (
		<Grow in={search.searchSelected} {...(search.searchSelected ? { timeout: 400 } : {})}>
			<TextField
				data-cy="search-by-patient-name-input"
				fullWidth
				label="Patient Name"
				onChange={(e) => setSearch((prev) => ({ ...prev, patientName: e.target.value }))}
				value={search.patientName}
				InputProps={{
					sx: {
						backgroundColor: theme.palette.glass,
						borderRadius: '8px',
					},
				}}
				sx={{
					'& .MuiInputLabel-root': {
						color: theme.palette.text.primary,
					},
					...primaryTextFieldStyles,
				}}
			/>
		</Grow>
	);
};
