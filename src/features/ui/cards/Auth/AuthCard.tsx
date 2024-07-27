import { Card, CardContent } from '@mui/material';
import { PropsWithChildren } from 'react';

export const AuthCardHeight = '320px';

export const AuthCard = ({ children }: PropsWithChildren) => {
	return (
		<Card
			sx={{
				width: '100%',
				borderRadius: 'var(--4, 32px) var(--4, 32px) 0px 0px;',
				boxShadow: '0px 1px 18px 0px rgba(59, 31, 43, 0.12);',
				minHeight: AuthCardHeight,
			}}
		>
			<CardContent>{children}</CardContent>
		</Card>
	);
};
