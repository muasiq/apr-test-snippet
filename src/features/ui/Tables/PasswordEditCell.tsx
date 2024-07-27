import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import { TextField } from '@mui/material';

interface IProps {
	id: string | number;
	field: string;
	value: string;
}

export const passwordCellStyles = {
	'& fieldset': { border: 'none' },
};

const PasswordEditCell = (props: GridRenderEditCellParams<IProps, string | null, string>) => {
	const { id, field, value = '' } = props;

	const apiRef = useGridApiContext();

	const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		try {
			await apiRef.current.setEditCellValue({ id, field, value: event.target.value });
		} catch (e) {
			console.error('Setting password failed', e);
		}
	};

	return <TextField type="password" autoFocus sx={passwordCellStyles} value={value} onChange={handleChange} />;
};

export default PasswordEditCell;
