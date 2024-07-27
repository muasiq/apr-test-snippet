import { Check, ContentCopy } from '@mui/icons-material';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';
import { useAlert } from '../../../common/hooks/useAlert';
import { delay } from '../../../common/utils/delay';

type CopyButtonProps = {
	className?: string;
	getTextToCopy: () => string;
	size?: IconButtonProps['size'];
	fontSize?: number;
};

export const CopyButton = ({ className, getTextToCopy, fontSize, size = 'medium' }: CopyButtonProps): JSX.Element => {
	const [didClickCopy, updateDidClickCopy] = useState(false);
	const [, copy] = useCopyToClipboard();
	const alert = useAlert();

	const handleCopy = async () => {
		updateDidClickCopy(true);
		try {
			await copy(getTextToCopy());
		} catch (error) {
			alert.addErrorAlert({ message: 'Failed to copy text' });
		}
		await delay(3000);
		updateDidClickCopy(false);
	};

	const iconStyles = { ...(fontSize ? { fontSize } : {}) };

	return (
		<Tooltip arrow placement="top" open={didClickCopy} title="Copied!">
			<IconButton size={size} className={className} onClick={() => handleCopy()}>
				{didClickCopy ? <Check sx={iconStyles} /> : <ContentCopy sx={iconStyles} />}
			</IconButton>
		</Tooltip>
	);
};
