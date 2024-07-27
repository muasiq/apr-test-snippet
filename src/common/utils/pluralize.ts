export function pluralize(word: string, count: number): string {
	if (count === 0 || count > 1) {
		return `${word}s`;
	}
	return word;
}
