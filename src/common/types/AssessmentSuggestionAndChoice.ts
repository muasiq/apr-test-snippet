import { AssessmentAnswer } from '@prisma/client';
import { z } from 'zod';
import { assessmentPlanBuilderSchema } from '~/server/api/routers/assessment/assessment.inputs';
export type GeneratedResponse = {
	generatedResponse: {
		choice: string | string[] | number | null;
		explanation?: string;
	};
};

export type SchemaAssessmentAnswer = Omit<AssessmentAnswer, 'checkedResponse | generatedResponse'> & {
	checkedResponse: {
		choice: string | string[] | number;
	};
} & GeneratedResponse;

export type Supply = {
	category: string;
	orderNeeded: 'Yes' | 'No';
	package?: string | null;
	deliveryMethod?: string | null;
	quantityToOrder?: number | null;
	quantityDelivered?: number | null;
};

export type SupplyListAssessmentAnswer = Omit<AssessmentAnswer, 'checkedResponse | generatedResponse'> & {
	checkedResponse: {
		choice: {
			supplies: Supply[];
		};
	};
	generatedResponse: {
		choice: {
			supplies: Supply[];
		};
	};
};

type MedAdminRecord = {
	name: string;
	time: string;
	dose: string;
	route: string;
};

export type MedAdminAssessmentAnswer = Omit<AssessmentAnswer, 'checkedResponse | generatedResponse'> & {
	checkedResponse: {
		choice: {
			med_administer_records: MedAdminRecord[];
		};
	};
	generatedResponse: {
		choice: {
			med_administer_records: MedAdminRecord[];
		};
	};
};

type Vaccination = {
	vaccineName: string;
	vaccineType: string;
	administeredBy?: string;
	administerDate: string;
	notes?: string;
};

export type VaccinationAssessmentAnswer = Omit<AssessmentAnswer, 'checkedResponse | generatedResponse'> & {
	checkedResponse: {
		choice: {
			vaccines: Vaccination[];
		};
	};
	generatedResponse: {
		choice: {
			vaccines: Vaccination[];
		};
	};
};

type Diagnosis = {
	diagnosisCode: string;
	diagnosisDescription: string;
	symptomControlRating: string;
	onsetOrExacerbation: string;
	dateOfOnsetOrExacerbation: string;
};

export type DiagnosisAssessmentAnswer = Omit<AssessmentAnswer, 'checkedResponse'> & {
	checkedResponse: {
		choice: {
			diagnoses: Diagnosis[];
		};
	};
};

type PlanBuilderChoice = z.infer<typeof assessmentPlanBuilderSchema>;
export type PlanBuilderAssessmentAnswer = Omit<AssessmentAnswer, 'checkedResponse'> & {
	checkedResponse: PlanBuilderChoice;
};
