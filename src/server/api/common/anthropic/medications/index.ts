import { compact } from 'lodash';
import { NurseInterviewQuestion, lookupQuestionByShortLabel } from '~/assessments/nurse-interview/questions';
import { customDrugs } from '~/common/constants/medication';
import { getSavedCustomDrugFormat, getSavedDispensableDrugFormat } from '~/common/utils/medication';
import { parseNumber } from '~/common/utils/parseNumber';
import { PatientWithAssessmentContext } from '~/server/api/routers/patient/patient.types';
import * as fdb from '../../fdb';
import { shouldMockAnthropic } from '../constants';
import { GenerateSuggestionParams } from '../generateSuggestion';
import { extractMedications } from './extractMedications';
import { getMedicationPatientInfo } from './getMedicationPatientInfo';
import { sampleMedExtracts } from './medsSample';
import { relevantInterviewQuestions } from './utils';

export async function medicationsSuggestion(params: GenerateSuggestionParams) {
	if (shouldMockAnthropic) {
		return Promise.resolve({ choice: { medications: sampleMedExtracts } });
	}
	const { patient, model } = params;

	const extractedMedications = await extractMedications(params);
	const resolvedMedications = await resolveMedicationsAgainstFDB(extractedMedications);

	const medications = await Promise.all(
		resolvedMedications.map(async (resolved, i) => {
			const extracted = extractedMedications[i]!;

			const medicationPatientInfo = await getMedicationPatientInfo({
				medication: { name: extracted.name, availableDoseUnits: resolved.fdb?.availableDoseUnits },
				model,
				patient,
			});

			const routes = resolved.route
				? { route: resolved.route, alternativeRoute: medicationPatientInfo?.route }
				: { route: medicationPatientInfo?.route };

			return {
				...extracted,
				...resolved,
				...medicationPatientInfo,
				...routes,
				doseAmount: parseNumber(medicationPatientInfo?.doseAmount),
				// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
				startDate: medicationPatientInfo?.startDate || patient.SOCVisitDate,
				configurationType: patient.configurationType,
			};
		}),
	);

	return { choice: { medications } };
}

async function resolveMedicationsAgainstFDB(
	medications: { name: string; strength?: string | null; doseUnit?: string | null }[],
) {
	return Promise.all(
		medications.map(async (med) => {
			const name = compact([med.name, med.strength, med.doseUnit]).join(' ');
			const resolved = await fdb.resolveDispensableDrug({ name });

			if (resolved) {
				const availableDoseUnits = await fdb.getDoseUnitOptions(resolved);
				return {
					name: resolved.DispensableDrugDesc,
					route: resolved.RouteDesc,
					fdb: getSavedDispensableDrugFormat(resolved, availableDoseUnits),
				};
			}

			const customDrug = customDrugs.find((drug) => drug.name.toLowerCase().includes(med.name.toLowerCase()));
			if (customDrug) {
				return {
					name: customDrug.name,
					route: customDrug.route,
					fdb: getSavedCustomDrugFormat(customDrug),
				};
			}

			return {};
		}),
	);
}

export function hasResponsesForSomeRelevantInterviewQuestions(patient: PatientWithAssessmentContext) {
	if (!patient.NurseInterview) return false;
	const allQuestionItems = patient.NurseInterview?.NurseInterviewThemeSummaries.flatMap((s) => {
		return s.QuestionItems;
	});
	const lookedUpRelevantQuestions = relevantInterviewQuestions
		.map((shortLabel) => lookupQuestionByShortLabel(shortLabel))
		.filter((q) => q) as NurseInterviewQuestion[];

	const lookedUpResponses = lookedUpRelevantQuestions
		.map((rq) => allQuestionItems.find((qi) => qi.question === rq.question))
		.some((q) => q);
	return lookedUpResponses;
}
