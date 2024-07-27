import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from '@mui/material';
import { SerializedForm } from '~/assessments/apricot/visit-note/renderers/react';
import { SerializedGroup } from '~/assessments/apricot/visit-note/serializeConfig';

export function SerializedConfigAccordion({ config }: { config: SerializedGroup[] }) {
	return (
		<Stack flexGrow={1} overflow={'auto'} p={2}>
			{config.map((group) => (
				<Box key={group.label} bgcolor={'#FFF'}>
					<Accordion
						key={group.label}
						sx={{ border: 'none' }}
						slotProps={{ transition: { unmountOnExit: true } }}
					>
						<AccordionSummary expandIcon={<ExpandMore />}>
							<Typography variant="h5">{group.label}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Stack spacing={2}>
								<SerializedForm config={group.children as SerializedGroup[]} />
							</Stack>
						</AccordionDetails>
					</Accordion>
				</Box>
			))}
		</Stack>
	);
}
