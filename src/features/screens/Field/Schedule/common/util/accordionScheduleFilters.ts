import { PatientStatus } from '@prisma/client';
import { addDays, isBefore, isToday, isWithinInterval, startOfDay } from 'date-fns';
import { RouterOutputs } from '~/common/utils/api';

export const getTodayPatients = (patients: RouterOutputs['patient']['getScheduleView'] | undefined) => {
	if (!patients) return [];

	return patients?.filter((patient) => {
		if (!patient.SOCVisitDate) return false;
		return patient.status === PatientStatus.NewPatient && isToday(patient.SOCVisitDate);
	});
};

export const getUpNextPatients = (patients: RouterOutputs['patient']['getScheduleView'] | undefined) => {
	if (!patients) return [];
	const today = new Date(new Date().toDateString());

	return patients?.filter((patient) => {
		if (!patient.SOCVisitDate) return false;
		return (
			patient.status === PatientStatus.NewPatient &&
			isWithinInterval(new Date(patient.SOCVisitDate.toDateString()), {
				start: addDays(today, 1),
				end: addDays(today, 5),
			})
		);
	});
};

export const getNotStartedPatients = (patients: RouterOutputs['patient']['getScheduleView'] | undefined) => {
	if (!patients) return [];
	return patients?.filter((patient) => {
		if (!patient.SOCVisitDate) return false;
		return (
			patient.status === PatientStatus.NewPatient &&
			!patient.InterviewQuestion.length &&
			isBefore(new Date(patient.SOCVisitDate.toDateString()), startOfDay(new Date()))
		);
	});
};

export const getInProgressPatients = (patients: RouterOutputs['patient']['getScheduleView'] | undefined) => {
	if (!patients) return [];
	return patients?.filter((patient) => {
		return patient.status === PatientStatus.Incomplete;
	});
};

export const getForReviewPatients = (patients: RouterOutputs['patient']['getScheduleView'] | undefined) => {
	if (!patients) return [];
	return patients?.filter((patient) => {
		return patient.status === PatientStatus.SignoffNeeded;
	});
};
