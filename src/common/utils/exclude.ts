export function exclude<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]) {
	const clone = Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key as K)));
	return clone as Omit<T, K>;
}
