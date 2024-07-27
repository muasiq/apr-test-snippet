import { PatientWithJoins } from '../../../server/api/routers/patient/patient.types';

export type PatientDataProps = {
	patientData: PatientWithJoins;
	print?: boolean;
};
