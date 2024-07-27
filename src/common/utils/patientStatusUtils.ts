import { PatientStatus } from '@prisma/client';
import { match, P } from 'ts-pattern';

export const postSignOffStatuses = [
	PatientStatus.Complete,
	PatientStatus.ReadyForEMR,
	PatientStatus.AddingToEMR,
] as const;
export function isPostSignOffStatus(status: PatientStatus) {
	return match(status)
		.with(P.union(...postSignOffStatuses), () => true)
		.with(
			P.union(
				PatientStatus.NewPatient,
				PatientStatus.Incomplete,
				PatientStatus.NonAdmit,
				PatientStatus.WithQA,
				PatientStatus.SignoffNeeded,
			),
			() => false,
		)
		.exhaustive();
}

export function isPostQAStatus(status: PatientStatus) {
	return match(status)
		.with(
			P.union(
				PatientStatus.Complete,
				PatientStatus.ReadyForEMR,
				PatientStatus.AddingToEMR,
				PatientStatus.SignoffNeeded,
			),
			() => true,
		)
		.with(
			P.union(PatientStatus.NewPatient, PatientStatus.Incomplete, PatientStatus.NonAdmit, PatientStatus.WithQA),
			() => false,
		)
		.exhaustive();
}

export const nurseInterviewPendingStatuses = [PatientStatus.NewPatient, PatientStatus.Incomplete] as const;
export function isNurseInterviewPending(status: PatientStatus) {
	return match(status)
		.with(P.union(...nurseInterviewPendingStatuses), () => true)
		.with(
			P.union(
				PatientStatus.WithQA,
				PatientStatus.ReadyForEMR,
				PatientStatus.AddingToEMR,
				PatientStatus.NonAdmit,
				PatientStatus.SignoffNeeded,
				PatientStatus.Complete,
			),
			() => false,
		)
		.exhaustive();
}

export function hasSomeNurseInterviewData(status: PatientStatus) {
	return match(status)
		.with(
			P.union(
				PatientStatus.Complete,
				PatientStatus.ReadyForEMR,
				PatientStatus.AddingToEMR,
				PatientStatus.WithQA,
				PatientStatus.SignoffNeeded,
				PatientStatus.Incomplete,
			),
			() => true,
		)
		.with(P.union(PatientStatus.NewPatient, PatientStatus.NonAdmit), () => false)
		.exhaustive();
}

export function statusAllowsAssessmentUpdates(status: PatientStatus) {
	return match(status)
		.with(
			P.union(
				PatientStatus.NewPatient,
				PatientStatus.Incomplete,
				PatientStatus.WithQA,
				PatientStatus.SignoffNeeded,
			),
			() => true,
		)
		.with(
			P.union(
				PatientStatus.NonAdmit,
				PatientStatus.ReadyForEMR,
				PatientStatus.AddingToEMR,
				PatientStatus.Complete,
			),
			() => false,
		)
		.exhaustive();
}

export const EMRDataEntryStatuses = [PatientStatus.ReadyForEMR, PatientStatus.AddingToEMR] as const;
export const ScheduleViewStatuses = [
	PatientStatus.NewPatient,
	PatientStatus.Incomplete,
	PatientStatus.SignoffNeeded,
] as const;

export const QAShouldBeRanWhenMovingToStatuses = [PatientStatus.ReadyForEMR, PatientStatus.SignoffNeeded] as const;

export function shouldQABeRunWhenMovingToThisStatus(status: PatientStatus) {
	return match(status)
		.with(P.union(...QAShouldBeRanWhenMovingToStatuses), () => true)
		.with(
			P.union(
				PatientStatus.NewPatient,
				PatientStatus.Incomplete,
				PatientStatus.WithQA,
				PatientStatus.NonAdmit,
				PatientStatus.AddingToEMR,
				PatientStatus.Complete,
			),
			() => false,
		)
		.exhaustive();
}
