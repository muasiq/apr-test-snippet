export const EVENT = {
	patientReadyForEMR: 'patient/ready-for-emr',
	patientVisitNoteRequested: 'patient/visit-note-requested',
} as const;

export type EventPayload = {
	[EVENT.patientReadyForEMR]: {
		data: { patientId: number };
	};
	[EVENT.patientVisitNoteRequested]: {
		data: { patientId: number };
	};
};
