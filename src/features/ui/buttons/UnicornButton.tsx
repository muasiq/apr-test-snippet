import { Button } from '@mui/material';
import { UserActionPermissions } from '../../../common/utils/permissions';
import { PermissionGuard } from '../auth/PermissionGuard';

type Props = {
	disabled: boolean;
	onClick: () => void;
};
export const UnicornButton = ({ disabled, onClick }: Props) => {
	return (
		<PermissionGuard neededPermission={UserActionPermissions.AUTOFILL_ALL_DOCUMENTATION_ITEMS}>
			<Button
				data-cy="rainbow-unicorn-button"
				disabled={disabled}
				variant="text"
				onClick={onClick}
				sx={{
					fontSize: '1.5rem',
					p: 0,
					m: 0,
				}}
			>
				🦄
			</Button>
		</PermissionGuard>
	);
};
