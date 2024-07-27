export const parseDate = (dateString?: string | null): Date | null => {
	if (!dateString) return null;
	try {
		return new Date(dateString);
	} catch (e) {
		console.error(`could not parse date: ${dateString}`, e);
		return null;
	}
};
