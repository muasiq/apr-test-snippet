/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as fs from 'fs';
import { compact } from 'lodash';
import { getQuestionBank } from '~/assessments/apricot/scripts/uploadNewItemsToAllQuestionsBank';
import { listDocs } from '../../scripts/docs';
import { getSheetData } from '../../scripts/sheets';
import { parseAnswersFile, toReplace } from '../data-files/scripts/createMasterQuestionMap';

export async function makeFile(config: string, tab: string, orgName: string, driveFolderId?: string) {
	const data = await getSheetData(config, tab);
	const toWrite = await Promise.all(
		data.rows.map(async (row) => {
			const data = row.toObject();
			if (data.responses) {
				if (tab === 'soc-standard-assessment' && isLargerResponse(data) && driveFolderId) {
					await handleDownloadingLargerResponses(data, 'Allergies', driveFolderId);
				}
				try {
					const parsed = JSON.parse(data.responses) as any[];
					parsed.map((p: any) => {
						if (p.followUp) {
							p.followup = p.followUp;
							delete p.followUp;
						}
						if (p.followup?.length && !Array.isArray(p.followup) && !p.followup.startsWith('[')) {
							p.followup = [p.followup];
						}
						if (!p.followup) {
							delete p.followup;
						} else {
							p.followup = compact(p.followup?.map((f: string) => f.trim()));
							if (tab === 'physical-assessment') {
								const oasisFollowUpsNotNeeded = [
									'PA-d50b20',
									'PA-ed3aea',
									'PA-6b551a',
									'PA-d1f1f6',
									'PA-0b3c1f',
									'PA-b8f0e4',
								];
								p.followup = p.followup.filter((f: string) => !oasisFollowUpsNotNeeded.includes(f));
							}
						}
					});
					return { ...data, responses: parsed };
				} catch (e) {
					console.log(data);
					console.error(e);
					throw e;
				}
			} else {
				delete data.responses;
			}
			return data;
		}),
	);
	if (tab === 'soc-standard-assessment') {
		const allergiesQuestion = toWrite.find((question) => question.id === 'MQ67LVO5CK');
		if (!allergiesQuestion) throw new Error('Allergies question not found');
		const otherResponse = allergiesQuestion.responses.find((response: any) => response.text === 'Other');
		if (!otherResponse) {
			allergiesQuestion.responses.push({
				text: 'Other',
				followup: ['MQ3ZFBFY4B'],
			});
		}
	}
	if (tab === 'physical-assessment' || tab === 'soc-standard-assessment') {
		await updateCleanedTextFromBank(toWrite, tab);
	}
	fs.writeFileSync(
		`src/assessments/home-care-home-base/orgs/${orgName}/data-files/${tab}.json`,
		JSON.stringify(toWrite, null, 2),
	);
}

async function updateCleanedTextFromBank(data: Partial<Record<string, any>>[], tab: string) {
	const bankItems = await getQuestionBank();
	data.forEach((d) => {
		const bankItem = bankItems.find((b) => b.id === d.id);
		if (bankItem) {
			if (tab === 'physical-assessment') {
				d.cleanedText = bankItem.cleanedText?.trim();
			} else if (tab === 'soc-standard-assessment') {
				d.originalText = bankItem.originalText?.trim();
			}
		}
	});
}

function isLargerResponse(data: Partial<Record<string, any>>) {
	const text = data.text;
	const matchesLookup = toReplace[text];
	if (matchesLookup && matchesLookup === 'Allergies') {
		return true;
	}
	return false;
}

async function handleDownloadingLargerResponses(
	data: Partial<Record<string, any>>,
	replaceMatch: string,
	driveFolderId: string,
) {
	const allFiles = await listDocs(driveFolderId);
	if (!allFiles) throw new Error('No files found in folder');
	const newResponses = await parseAnswersFile(replaceMatch, allFiles);
	data.responses = JSON.stringify(newResponses);
}
