export const updateRelevantPages = (
	relevantPages: Map<number, number[]>,
	artifactId: number,
	selectedPageNumber: number,
) => {
	const updatedRelevantPages = new Map(relevantPages);
	const currentRelevantPages = updatedRelevantPages.get(artifactId) ?? [];

	if (currentRelevantPages.includes(selectedPageNumber)) {
		return updatedRelevantPages.set(
			artifactId,
			currentRelevantPages.filter((pageNumber) => pageNumber !== selectedPageNumber),
		);
	}

	return updatedRelevantPages.set(artifactId, [...currentRelevantPages, selectedPageNumber]);
};
