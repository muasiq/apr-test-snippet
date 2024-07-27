import { MenuItem, Stack, TextField } from '@mui/material';
import { PatientStatus } from '@prisma/client';
import * as React from 'react';

export function NewPatientStatus({
	status,
	onSelectStatus,
}: {
	status: PatientStatus;
	onSelectStatus: (status: PatientStatus) => void;
}) {
	const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onSelectStatus(event.target.value as PatientStatus);
	};

	return (
		<Stack direction="row" spacing={2}>
			<TextField
				sx={{ width: '14.3rem' }}
				select
				size="small"
				value={status}
				label="Patient Status"
				onChange={handleStatusChange}
			>
				{Object.values(PatientStatus)
					.filter((s) => s === PatientStatus.NewPatient)
					.map((status) => (
						<MenuItem key={status} value={status}>
							{status}
						</MenuItem>
					))}
			</TextField>
		</Stack>
	);
}
