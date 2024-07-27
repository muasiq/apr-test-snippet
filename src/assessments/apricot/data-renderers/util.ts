import { add, sub } from 'date-fns';
import { PatientWithJoins } from '~/server/api/routers/patient/patient.types';

export function getDriveEndTime(patientData: PatientWithJoins) {
	const visitStartTime = patientData.SOCVisitTime;

	if (!visitStartTime) return null;

	const endTime = sub(visitStartTime, { minutes: 1 });

	return endTime;
}

export function getDriveStartTime(patientData: PatientWithJoins) {
	const visitStartTime = patientData.SOCVisitTime;
	const driveTime = patientData.NurseInterview?.minutesSpentDriving;

	if (!visitStartTime || !driveTime) return null;

	const startTime = sub(visitStartTime, { minutes: 1 + driveTime });

	return startTime;
}

export function getSocVisitEndTime(patientData: PatientWithJoins) {
	const interviewDuration = patientData.NurseInterview?.minutesSpentWithPatient;

	if (!interviewDuration || !patientData.SOCVisitTime) {
		return null;
	}

	const endTime = add(patientData.SOCVisitTime, { minutes: interviewDuration });

	return endTime;
}

export function getVitalSignMeasurementTime(patientData: PatientWithJoins) {
	const visitStartTime = patientData.SOCVisitTime;

	if (!visitStartTime) return null;

	const endTime = add(visitStartTime, { minutes: 15 });

	return endTime;
}
