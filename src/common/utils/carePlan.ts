import { Configuration } from '../../assessments/configurations';

export function getProblemDetails(problemName: string, configuration: Configuration) {
	const problemItem = configuration.pathways
		.flatMap((item) => item.problemItems)
		.find((item) => item.problemItem === problemName);

	if (!problemItem) throw new Error(`problem not found: ${problemName}`);
	return problemItem;
}

export const getProblemItems = (configuration: Configuration, category?: string[]) => {
	return configuration.pathways.flatMap((item) => {
		if (category?.includes(item.problemCategory)) {
			return item.problemItems.map(({ problemItem, problemItemClean, treatmentCode }) => ({
				label: `(${treatmentCode}) ${problemItemClean}`,
				value: problemItem,
			}));
		}
		return [];
	});
};
