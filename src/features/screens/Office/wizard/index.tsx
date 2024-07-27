import { Autocomplete, Box, Button, MenuItem, Stack, TextField } from '@mui/material';
import { PatientStatus } from '@prisma/client';
import { useMemo, useState } from 'react';
import { useAlert } from '~/common/hooks/useAlert';
import { api } from '~/common/utils/api';
import { GenerateTestPatientDataInput } from '~/server/api/routers/patient/patient.inputs';
import { NewPatientStatus } from './helpers';

export function CreatePatientWizard() {
	const alert = useAlert();
	const { data: locations } = api.organization.getLocations.useQuery();
	const resolvedLocations = locations?.map((loc) => ({ id: loc.id, label: loc.name })) ?? [];
	const [chosenLocationId, setChosenLocationId] = useState<number | undefined>(undefined);

	const [patientStatus, setPatientStatus] = useState<PatientStatus>(PatientStatus.NewPatient);

	const [numberOfPatients, setNumberOfPatients] = useState<number | null>(1);

	const [seedIds, setSeedIds] = useState<number[]>([]);

	const updateSeedIds = (newSeedIds: (string | number)[]) => {
		const ids = newSeedIds.map((id) => (typeof id === 'string' ? Number(id) : id));
		setSeedIds(ids);
	};

	const { data: caseManagers } = api.user.getCaseManagerUsers.useQuery();
	const resolvedUsers = useMemo(() => {
		return (
			caseManagers
				?.filter((user) => user.Locations.some((loc) => loc.id === (chosenLocationId ?? 0)))
				.map((user) => ({ id: user.id, label: user.name ?? user.email })) ?? []
		);
	}, [caseManagers, chosenLocationId]);

	const [selectedCaseManager, setSelectedCaseManager] = useState<string | undefined>(undefined);

	const btnText = numberOfPatients === 1 ? 'Patient' : 'Patients';

	const orgQuery = api.organization.getUserOrganization.useQuery();

	const patientCreate = api.patient.generateTestPatientData.useMutation({
		onSuccess: () => {
			alert.addSuccessAlert({
				title: 'Success',
				message: `${btnText} created successfully`,
			});
		},

		onError: (error) => {
			alert.addErrorAlert({
				title: 'Error creating patient(s)',
				message: error.message,
			});
		},
	});

	const handleCreatePatient = () => {
		const initSeedConfig: GenerateTestPatientDataInput = {
			orgId: orgQuery.data?.id ?? 0,
			caseManagerId: selectedCaseManager ?? '',
			locationId: chosenLocationId ?? 0,
			patientStatus,
			numberOfPatients: numberOfPatients ?? 1,
			caseManagerName: resolvedUsers.find((user) => user.id === selectedCaseManager)?.label ?? '',
		};
		if (seedIds.length) {
			initSeedConfig.seedInput = { seedIds };
		}
		void patientCreate.mutate(initSeedConfig);
	};

	return (
		<Box>
			<Stack sx={{ flexGrow: 1, marginY: '1em' }} direction={'column'} spacing={3}>
				<TextField
					sx={{ width: '14.3rem' }}
					size="small"
					type="number"
					label="Number of Patients"
					defaultValue={numberOfPatients}
					onChange={(e) => setNumberOfPatients(Number(e.target.value))}
				/>
				<TextField
					sx={{ width: '14.3rem' }}
					select
					size="small"
					label="Location"
					defaultValue={''}
					onChange={(e) => setChosenLocationId(Number(e.target.value))}
				>
					{resolvedLocations.map((loc) => (
						<MenuItem key={loc.id} value={loc.id}>
							{loc.label}
						</MenuItem>
					))}
				</TextField>
				<TextField
					sx={{ width: '14.3rem' }}
					select
					size="small"
					label="Case Manager"
					defaultValue={undefined}
					value={selectedCaseManager ?? ''}
					onChange={(e) => setSelectedCaseManager(e.target.value)}
				>
					{resolvedUsers.map((user) => (
						<MenuItem key={user.id} value={user.id}>
							{user.label}
						</MenuItem>
					))}
				</TextField>
				<NewPatientStatus status={patientStatus} onSelectStatus={setPatientStatus} />
				<Autocomplete
					sx={{ width: '14.3rem' }}
					multiple
					freeSolo
					disableClearable={true}
					limitTags={3}
					options={[]}
					defaultValue={[]}
					value={seedIds}
					onChange={(e, newValue) => {
						if (newValue) {
							updateSeedIds(newValue);
						}
					}}
					renderInput={(params) => <TextField {...params} label="ids to clone ..." />}
				/>
			</Stack>
			<Stack direction="row" spacing={2}>
				<Button variant="contained" onClick={handleCreatePatient}>
					Create {btnText}
				</Button>
			</Stack>
		</Box>
	);
}
