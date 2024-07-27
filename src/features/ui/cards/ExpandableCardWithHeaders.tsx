import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { Box, Button, Card, CardContent, CardHeader, Collapse, Stack } from '@mui/material';
import { PropsWithChildren, useState } from 'react';
import theme from '~/styles/theme';

export type ExpandableCardWithHeadersProps = {
	title: string;
	subheader?: string;
	defaultExpanded?: boolean;
	height?: string;
} & PropsWithChildren;
export function ExpandableCardWithHeaders({
	title,
	subheader,
	children,
	defaultExpanded = false,
	height = '500px',
}: ExpandableCardWithHeadersProps): JSX.Element {
	const [expanded, setExpanded] = useState(defaultExpanded);
	const showHideButtonText = expanded ? 'Hide' : 'Show';
	return (
		<>
			<Card>
				<CardHeader title={title} subheader={subheader} subheaderTypographyProps={{ mt: 1 }} />

				<Collapse in={expanded} timeout="auto">
					<CardContent>
						<Box sx={{ height }}>{children}</Box>
					</CardContent>
				</Collapse>
				<Stack direction="row" justifyContent={'center'}>
					<Button
						fullWidth
						sx={{ color: theme.palette.secondary.main }}
						startIcon={expanded ? <ArrowUpward /> : <ArrowDownward />}
						variant="text"
						onClick={() => setExpanded(!expanded)}
					>
						{showHideButtonText}
					</Button>
				</Stack>
			</Card>
		</>
	);
}
