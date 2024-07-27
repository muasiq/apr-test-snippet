import { PatientStatus } from '@prisma/client';
import { match } from 'ts-pattern';

export const patientStatusEnumToText = (status: PatientStatus): string => {
	return match(status)
		.with(PatientStatus.NewPatient, () => 'New Patient')
		.with(PatientStatus.Incomplete, () => 'Assessment Started')
		.with(PatientStatus.WithQA, () => 'Drafting Documentation')
		.with(PatientStatus.SignoffNeeded, () => 'Pending Signoff')
		.with(PatientStatus.Complete, () => 'Complete')
		.with(PatientStatus.ReadyForEMR, () => 'Ready For EMR')
		.with(PatientStatus.AddingToEMR, () => 'Adding To EMR')
		.with(PatientStatus.NonAdmit, () => 'Non Admit')
		.exhaustive();
};
