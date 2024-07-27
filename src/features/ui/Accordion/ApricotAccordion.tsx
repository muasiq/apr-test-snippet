import { ExpandLess } from '@mui/icons-material';
import { Accordion, AccordionSummary, Box, Chip, Collapse, Stack, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';
import theme from '~/styles/theme';

type Props = {
	title: string;
	numberOfItems: number;
	defaultExpanded?: boolean;
	isLoading?: boolean;
};

export const ApricotAccordion = ({
	title,
	numberOfItems,
	defaultExpanded,
	isLoading,
	children,
}: PropsWithChildren<Props>) => {
	return (
		<Box>
			<Accordion
				defaultExpanded={numberOfItems === 0 || defaultExpanded}
				sx={{
					'&:last-of-type, &:first-of-type': {
						borderRadius: '24px',
						border: '2px solid #FFFFFF',
						boxShadow: 'none',
					},
				}}
			>
				<AccordionSummary
					expandIcon={<ExpandLess sx={{ color: theme.palette.text.primary }} />}
					sx={{ height: '68px' }}
				>
					<Stack direction="row" alignItems="center" spacing={1}>
						<Typography variant="h5">{title}</Typography>
						<Chip size="small" label={numberOfItems} sx={{ backgroundColor: 'primary.light' }} />
					</Stack>
				</AccordionSummary>
				<Collapse in={!isLoading}>
					{numberOfItems === 0 ? (
						<Typography p={2} variant="subtitle2" color={'text.disabled'}>
							Queue Empty
						</Typography>
					) : (
						children
					)}
				</Collapse>
			</Accordion>
		</Box>
	);
};
