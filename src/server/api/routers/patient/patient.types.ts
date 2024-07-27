import { Prisma } from '@prisma/client';

export type PatientWithAssessmentContext = Prisma.PatientGetPayload<{
	include: {
		InterviewQuestion: true;
		PatientArtifacts: { include: { patientDocumentArtifact: { include: { paragraphs: true } } } };
		NurseInterview: { include: { NurseInterviewThemeSummaries: { include: { QuestionItems: true } } } };
	};
}>;

export type NurseInterviewWithSummaries = Prisma.NurseInterviewGetPayload<{
	include: { NurseInterviewThemeSummaries: true };
}>;

export type NurseInterviewThemeSummaryWithQuestions = Prisma.NurseInterviewThemeSummariesGetPayload<{
	include: { QuestionItems: true };
}>;

export const PatientWithJoinsInclude = {
	Organization: {
		include: {
			SkilledNursingServiceCodes: true,
			AdditionalEvaluationServiceCodes: true,
		},
	},
	Location: true,
	NurseInterview: {
		include: {
			NurseInterviewThemeSummaries: {
				include: {
					QuestionItems: true,
				},
			},
		},
	},
	InterviewQuestion: true,
	PatientArtifacts: {
		include: {
			attachmentType: true,
			patientDocumentArtifact: {
				include: {
					paragraphs: false,
				},
			},
		},
	},
	PatientEmergencyContacts: true,
	PatientAssociatedPhysicians: true,
	SOCVisitCaseManager: true,
	PayorSources: true,
	PatientReferralSource: true,
	NurseConfirmedAssessmentSections: true,
};
export type PatientWithJoinsIncludeType = typeof PatientWithJoinsInclude;
export type PatientWithJoins = Prisma.PatientGetPayload<{
	include: {
		Organization: true;
		Location: true;
		NurseInterview: {
			include: {
				NurseInterviewThemeSummaries: {
					include: {
						QuestionItems: true;
					};
				};
			};
		};
		InterviewQuestion: true;
		PatientArtifacts: {
			include: {
				patientDocumentArtifact: {
					include: {
						paragraphs: false;
					};
				};
			};
		};
		PatientEmergencyContacts: true;
		PatientAssociatedPhysicians: true;
		SOCVisitCaseManager: true;
		PayorSources: true;
		PatientReferralSource: true;
		NurseConfirmedAssessmentSections: true;
	};
}>;

export type PatientWithArtifacts = Prisma.PatientGetPayload<{
	include: {
		Location: true;
		NurseInterview: {
			include: {
				NurseInterviewThemeSummaries: {
					include: {
						QuestionItems: true;
					};
				};
			};
		};
		InterviewQuestion: true;
		PatientArtifacts: {
			include: {
				patientDocumentArtifact: true;
			};
		};
		PatientEmergencyContacts: true;
		PatientAssociatedPhysicians: true;
		SOCVisitCaseManager: true;
		PayorSources: true;
		PatientReferralSource: true;
	};
}>;

export type PatientWithReviewContext =
	| Prisma.PatientGetPayload<{
			include: {
				InterviewQuestion: true;
				NurseInterview: { include: { NurseInterviewThemeSummaries: { include: { QuestionItems: true } } } };
			};
	  }>
	| undefined;
