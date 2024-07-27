import { Box, Stack } from '@mui/material';
import React from 'react';
import { CopyButton } from '~/features/ui/buttons/CopyButton';

type Props = {
	children: React.ReactNode;
	getValue: () => string;
	canCopy?: boolean;
};

export const WithCopyWrapper = ({ children, getValue, canCopy }: Props) => {
	return (
		<Stack direction="row" alignItems="center" spacing={1}>
			<Box width={'100%'}>{children}</Box>
			{canCopy && (
				<Box flexShrink={0}>
					<CopyButton getTextToCopy={getValue} />
				</Box>
			)}
		</Stack>
	);
};
