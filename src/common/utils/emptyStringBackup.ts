export const emptyStringBackup = (str: string | null | undefined, backup = 'Unknown'): string => {
	if (!str) return backup;
	return str;
};
