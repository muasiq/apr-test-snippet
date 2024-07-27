import { Close, Error } from '@mui/icons-material';
import { Alert, Button, Dialog, DialogContent, IconButton, Stack, Typography } from '@mui/material';
import { groupBy } from 'lodash';
import { useMemo } from 'react';
import { useDialogState } from '~/common/hooks/useDialogState';
import { BottomDrawer } from '~/features/ui/layouts/BottomDrawer';
import { If } from '~/features/ui/util/If';
import { AssessmentMedicationSchema } from '~/server/api/routers/assessment/assessment.inputs';
import { InteractionsBanner } from './InteractionsBanner';

type Severity = keyof typeof severityMap;

const severityMap = {
	'1': { color: 'error', label: 'Severe Interactions' },
	'2': { color: 'warning', label: 'Serious Interactions' },
	'3': { color: 'info', label: 'Moderate Interactions' },
} as const;

const severityOrder: Severity[] = ['1', '2', '3'];

type Props = {
	open: boolean;
	onVerify: () => void;
	onClose: () => void;
	interactions: AssessmentMedicationSchema['interactions'];
	isCaseManager: boolean;
};

type Interaction = NonNullable<AssessmentMedicationSchema['interactions']>['data'][0];

export function InteractionsDrawer({ open, onVerify, onClose, interactions, isCaseManager }: Props) {
	const termsDialog = useDialogState();

	const onConfirmInteractions = () => {
		if (isCaseManager && interactions?.data.length && !interactions?.verified) {
			termsDialog.open();
		} else {
			onClose();
		}
	};

	const onAcceptTerms = () => {
		termsDialog.close();
		onVerify();
	};

	return (
		<>
			<BottomDrawer
				isOpen={open}
				setIsOpen={onConfirmInteractions}
				label="Medication Interactions"
				closeButtonText="Confirm"
				noPadding
			>
				{!!interactions?.verified && <InteractionsBanner interactions={interactions} hideAction />}
				<Interactions interactions={interactions} />
			</BottomDrawer>
			<TermsDialog {...termsDialog} accept={onAcceptTerms} />
		</>
	);
}

function TermsDialog({ isOpen, close, accept }: { isOpen: boolean; close: () => void; accept: () => void }) {
	return (
		<Dialog open={isOpen} onClose={close} fullScreen PaperProps={{ sx: { backgroundColor: '#180C11E5' } }}>
			<DialogContent>
				<IconButton sx={{ color: '#FFF', position: 'absolute', top: 24, right: 24 }} onClick={close}>
					<Close />
				</IconButton>
				<Stack
					spacing={4}
					textAlign="center"
					alignItems="center"
					justifyContent="center"
					sx={{ height: '100%' }}
					p={3}
				>
					<Typography variant="h4" color="primary.main">
						Medication Review Attestation
					</Typography>
					<Typography variant="body2" color="primary.contrastText">
						By clicking &quot;I Agree&quot;, you acknowledge that you have reviewed the medication(s) for
						any potential adverse effects and drug reactions, including ineffective drug therapy,
						significant side effects, significant drug interactions, duplicate drug therapy, and
						non-compliance with drug therapy.
					</Typography>
					<Stack spacing={1} sx={{ width: '100%' }}>
						<Button fullWidth variant="contained" color="primary" onClick={accept}>
							I Agree
						</Button>
						<Button fullWidth variant="outlined" color="primary" onClick={close}>
							Go Back
						</Button>
					</Stack>
				</Stack>
			</DialogContent>
		</Dialog>
	);
}

function Interactions({ interactions }: { interactions: Props['interactions'] }) {
	const interactionsBySeverity = useMemo(() => {
		if (!interactions?.data.length) {
			return [];
		}

		const grouped = groupBy(interactions?.data, 'Severity');
		return severityOrder
			.map((severity) => ({ severity, interactions: grouped[severity] }))
			.filter((d) => d.interactions?.length);
	}, [interactions?.data]) as { severity: Severity; interactions: Interaction[] }[];

	if (!interactionsBySeverity.length) {
		return <Typography>No interactions between medications</Typography>;
	}

	return (
		<Stack spacing={3} p={2}>
			{interactionsBySeverity.map(({ severity, interactions }) => {
				const { color, label } = severityMap[severity];
				const severityDesc = interactions[0]?.SeverityDesc ?? '';
				return (
					<Stack key={severity} spacing={2}>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<Typography color={`${color}.main`} variant="h6">
								{label}
							</Typography>
							<Error color={color} />
						</Stack>
						<If condition={!!severityDesc}>
							<Alert severity={color} icon={false}>
								{getTextAfterFirstColon(severityDesc)}
							</Alert>
						</If>
						<Stack spacing={2}>
							{interactions?.map((interaction) => {
								return (
									<Stack
										key={interaction.InteractionID}
										sx={{ borderLeft: 2, borderColor: 'secondary.light' }}
										pl={2}
									>
										<Stack mb={1}>
											{interaction.ScreenDrugs.map((drug) => (
												<Typography key={drug.DrugID} variant="body2" fontWeight="bold">
													{drug.DrugDesc}
												</Typography>
											))}
										</Stack>
										<Typography variant="body2">{interaction.ClinicalEffectsNarrative}</Typography>
									</Stack>
								);
							})}
						</Stack>
					</Stack>
				);
			})}
		</Stack>
	);
}

function getTextAfterFirstColon(str: string) {
	const index = str.indexOf(':');
	if (index === -1) {
		return str;
	}
	return str.substring(index + 1).trim();
}
