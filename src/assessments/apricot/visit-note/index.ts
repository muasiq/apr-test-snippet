import { renderToBuffer } from '@react-pdf/renderer';
import { jsx } from 'react/jsx-runtime';
import { Configuration } from '~/assessments/configurations';
import { SchemaAssessmentAnswer } from '~/common/types/AssessmentSuggestionAndChoice';
import { PatientWithJoins } from '~/server/api/routers/patient/patient.types';
import { PdfRender } from './renderers/pdf';
import { serialize } from './serializeConfig';

type VisitNoteProps = {
	configuration: Configuration;
	patientData: PatientWithJoins;
	answers: SchemaAssessmentAnswer[];
	includeExplanations?: boolean;
};

export function getVisitNoteConfig(configuration: Configuration) {
	const visitNodeGroup = configuration.backOfficeCompletedConfig.find((d) => d.heading === 'Visit Note');
	return visitNodeGroup?.subHeadings ?? [];
}

export function VisitNote({ configuration, patientData, answers, includeExplanations }: VisitNoteProps) {
	const serialized = serialize(
		getVisitNoteConfig(configuration),
		{ configuration, patientData, answers },
		{ includeExplanations },
	);
	return jsx(PdfRender, { config: serialized, patientData: patientData });
}

export async function getVisitNotePdfBuffer(props: VisitNoteProps) {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	return renderToBuffer(jsx(VisitNote, props));
}
