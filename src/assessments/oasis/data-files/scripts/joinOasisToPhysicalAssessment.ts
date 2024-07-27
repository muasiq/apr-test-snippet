import fs from 'fs';
import { omit } from 'lodash';
import { createPhysicalAssessment } from '~/assessments/home-care-home-base/data-files/scripts/assessmentFormViewer';
import { options } from '~/assessments/home-care-home-base/orgs/accentra/options';
import { listDocs } from '~/assessments/scripts/docs';
import currentOasis from '../oasis_e_SOC.json';

async function main() {
	const {
		folderWithFiles,
		physicalAssessmentFileNameInSheets,
		superDuperConfigSheetId,
		physicalAssessmentHtml,
		xMap,
	} = options;
	const allFiles = await listDocs(folderWithFiles);
	const physicalAssessmentFile = allFiles?.find((f) => f.name === physicalAssessmentFileNameInSheets);

	if (!physicalAssessmentFile) throw new Error('missing files');

	const allOasisFromPA = await createPhysicalAssessment(
		physicalAssessmentFile,
		superDuperConfigSheetId,
		physicalAssessmentHtml,
		xMap,
		'OASIS',
	);
	const newOasis = currentOasis.map((oasisItem) => {
		const match = allOasisFromPA.find((paItem) => paItem.originalText.includes(`(${oasisItem.id})`));
		if (!match) {
			console.log('No match found for', oasisItem.text);
			return {
				QA_CHECK_ME: true,
				...oasisItem,
			};
		}

		const responses =
			oasisItem.responses && ['Code', 'Checklist'].includes(oasisItem.questionType)
				? oasisItem.responses.map((response, index) => {
						if (oasisItem.responses.length === match.responses?.length) {
							const responseMatch = match.responses[index]!.text.trim();
							if (!transformForMatch(responseMatch).includes(transformForMatch(response.text))) {
								console.warn('potential mismatch', response.text, responseMatch);
							}
							return {
								...response,
								originalText: responseMatch,
							};
						} else {
							const responseMatch = match.responses?.find((paResponse) =>
								transformForMatch(paResponse.text).includes(transformForMatch(response.text)),
							);
							if (!responseMatch) {
								console.log('No response match found for', response.text);
								return {
									QA_CHECK_ME: true,
									...response,
								};
							}
							return {
								...response,
								originalText: responseMatch?.text.trim(),
							};
						}
					})
				: oasisItem.responses;
		return {
			originalText: match.originalText,
			...omit(oasisItem, ['originalText', 'responses']),
			responses,
		};
	});
	const panelsRemoved = newOasis.filter((o) => o.type !== 'panel');
	fs.writeFileSync('src/assessments/oasis/data-files/oasis_e_SOC-new.json', JSON.stringify(panelsRemoved, null, 2));
}

function transformForMatch(s: string): string {
	return s
		.toLowerCase()
		.replaceAll('.', '')
		.replaceAll(',', '')
		.replaceAll(' ', '')
		.replaceAll('-', '')
		.replaceAll('(', '')
		.replaceAll(')', '')
		.trim();
}

main().catch(console.error);
