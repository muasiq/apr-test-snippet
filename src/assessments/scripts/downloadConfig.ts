import { Group } from '../types';
import { getSheetData } from './sheets';

interface ConfigSheetRow {
	id: string;
	heading: string;
	subHeading: string;
	artifactContext: string;
	interviewContext: string;
	note: string;
	patientDataResolver: string;
	autoCalculateFieldResolver: string;
	prerequisiteSatisfied: string;
}

export async function downloadConfig(workeheetId: string, tab: string, pathToWriteTo: string) {
	const { rows } = await getSheetData<ConfigSheetRow>(workeheetId, tab);
	const allData = rows.map((row) => row.toObject());
	const config: Group[] = [];
	for (const row of allData) {
		const {
			id,
			heading,
			subHeading,
			artifactContext,
			interviewContext,
			note,
			patientDataResolver,
			autoCalculateFieldResolver,
			prerequisiteSatisfied,
		} = row;
		if (!heading || !subHeading) throw new Error('Heading or subheading missing');
		const questionToAdd = {
			id,
			...addPropertyIfExists(artifactContext),
			...addPropertyIfExists(interviewContext),
			...addPropertyIfExists(note),
			...addPropertyIfExists(patientDataResolver),
			...addPropertyIfExists(autoCalculateFieldResolver),
			...addPropertyIfExists(prerequisiteSatisfied),
		};
		const existingHeading = config.find((c) => c.heading === row.heading);
		if (existingHeading) {
			const existingSubHeading = existingHeading.subGroups.find((s) => s.heading === row.subHeading);
			if (existingSubHeading) {
				existingSubHeading.questions.push(questionToAdd);
			} else {
				existingHeading.subGroups.push({
					heading: subHeading,
					questions: [questionToAdd],
				});
			}
		} else {
			config.push({
				heading,
				subGroups: [
					{
						heading: subHeading,
						questions: [questionToAdd],
					},
				],
			});
		}
	}
}

function addPropertyIfExists<T>(prop: T | undefined | null) {
	return prop ? { prop } : {};
}
