import { PatientArtifactTag } from '@prisma/client';
import { ShortLabels } from '../../../../../assessments/nurse-interview/questions';
import { interviewResponseLookup } from '../../../../../common/utils/interviewResponseLookup';
import { parseNumber } from '../../../../../common/utils/parseNumber';
import { PatientWithAssessmentContext } from '../../../routers/patient/patient.types';
import { documentTextForRelevantPages, getResponsesForRelevantInterviewQuestion } from '../util';

export const relevantInterviewQuestions = [
	ShortLabels.HealthHistory,
	ShortLabels.FunctionalHistory,
	ShortLabels.MedicationManagement,
	ShortLabels.PainDescription,
	ShortLabels.MemoryAssessment,
	ShortLabels.CognitiveAbilities,
	ShortLabels.PsychologicalState,
	ShortLabels.ImmuneBloodHealth,
	ShortLabels.InterventionsNeeded,
	ShortLabels.EndocrineSystemEvaluation,
	ShortLabels.CardiovascularHealth,
	ShortLabels.RespiratoryHealth,
	ShortLabels.NoseThroatSinuses,
	ShortLabels.HeadNeckExamination,
	ShortLabels.MusculoskeletalHealth,
	ShortLabels.NutritionalStatus,
	ShortLabels.GenitourinarySystem,
	ShortLabels.GastrointestinalAssessment,
];

const dosageRegex = /(\d+)\s*(.*)/;
export function extractDoseAmountAndUnit<T extends { dose?: string | null }>(medication: T) {
	const [, doseAmount, doseUnit] = medication.dose?.match(dosageRegex) ?? [];
	return {
		...medication,
		doseAmount: parseNumber(doseAmount),
		doseUnit,
	};
}

export function getRelevantInterviewNotes(patient: PatientWithAssessmentContext) {
	const lookedUpResponses = getResponsesForRelevantInterviewQuestion(patient, relevantInterviewQuestions);
	return lookedUpResponses.reduce((notes, lur) => notes + `\n${interviewResponseLookup(lur, patient)}`, '');
}

export function getOcrTextFromPatient(patient: PatientWithAssessmentContext) {
	const medicationDocuments = patient.PatientArtifacts.filter(
		(artifact) => artifact.tagName === PatientArtifactTag.Medication,
	);
	const referralDocuments = patient.PatientArtifacts.filter((a) => {
		return a.tagName === PatientArtifactTag.ReferralDocument && a.patientDocumentArtifact?.relevantMedPages.length;
	});
	const allReferralOCRText = referralDocuments.reduce((allText, document) => {
		const docText = documentTextForRelevantPages(
			document,
			[],
			(doc) => doc.patientDocumentArtifact?.relevantMedPages,
		);
		return allText + docText;
	}, '');
	const allMedicationOCRText = medicationDocuments.reduce((allText, document) => {
		return allText + document.patientDocumentArtifact?.documentRawText ?? '';
	}, '');
	return allMedicationOCRText + allReferralOCRText;
}
