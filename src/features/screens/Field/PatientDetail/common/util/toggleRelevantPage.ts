export const toggleRelevantPage = (pageNumber: number, currentPages: number[]) => {
	if (currentPages.includes(pageNumber)) {
		return currentPages.filter((page) => page !== pageNumber);
	}
	return [...currentPages, pageNumber];
};
