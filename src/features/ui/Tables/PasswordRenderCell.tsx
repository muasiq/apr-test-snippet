import { GridRenderCellParams } from '@mui/x-data-grid-pro';
import { TextField } from '@mui/material';

interface IProps {
	value: string;
}

export const passwordCellStyles = {
	'& fieldset': { border: 'none' },
};

const PasswordRenderCell = (props: GridRenderCellParams<IProps, string | null, string>) => {
	const { value = '' } = props;

	return <TextField type="password" sx={passwordCellStyles} value={value} />;
};

export default PasswordRenderCell;
