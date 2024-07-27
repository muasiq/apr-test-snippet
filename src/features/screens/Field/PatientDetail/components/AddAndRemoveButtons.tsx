import { Add, Remove } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import theme from '~/styles/theme';

type Props = {
	removeText?: string;
	handleRemove?: () => void;
	addText?: string;
	handleAdd: () => void;
	readOnly: boolean;
	shouldShowAdd: boolean;
	shouldShowRemove?: boolean;
};
export const AddAndRemoveButtons = ({
	addText = 'Add',
	removeText = 'Remove Above',
	handleAdd,
	handleRemove,
	shouldShowAdd,
	shouldShowRemove = true,
	readOnly,
}: Props) => {
	return (
		<Stack alignItems={'start'}>
			{shouldShowRemove && (
				<Button
					variant="text"
					disabled={readOnly}
					startIcon={<Remove />}
					onClick={handleRemove}
					sx={{ color: theme.palette.error.main }}
					data-cy="remove-button"
				>
					{removeText}
				</Button>
			)}

			{shouldShowAdd && (
				<Button
					variant="text"
					disabled={readOnly}
					startIcon={<Add />}
					onClick={handleAdd}
					sx={{ color: theme.palette.secondary.main }}
					data-cy="add-button"
				>
					{addText}
				</Button>
			)}
		</Stack>
	);
};
