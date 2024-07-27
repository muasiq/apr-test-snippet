export const addMultipleIndex = (id: string, index?: number | null): string => {
	if (!index) {
		return id;
	}
	return `${id}-#${index}`;
};
