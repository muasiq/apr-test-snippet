import { AutoAwesome } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useRouter } from 'next/router';
import { UserActionPermissions } from '../../../../common/utils/permissions';
import { PermissionGuard } from '../../../ui/auth/PermissionGuard';

type Props = {
	source: string;
	assessmentNumber: string;
};
export const OpenPromptIterate = ({ source, assessmentNumber }: Props): JSX.Element => {
	const router = useRouter();
	return (
		<PermissionGuard neededPermission={UserActionPermissions.VIEW_PROMPT_ITERATION_SCREEN}>
			<IconButton
				onClick={() => router.push({ pathname: '/office/iterate', query: { source, assessmentNumber } })}
			>
				<AutoAwesome />
			</IconButton>
		</PermissionGuard>
	);
};
