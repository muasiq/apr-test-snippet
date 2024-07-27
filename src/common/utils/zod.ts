import { z } from 'zod';

export const requiredString = z.string().min(1, { message: 'Required' });

export const coercedStringArray = z
	.union([z.array(z.string().min(1)), z.string().min(1)])
	.transform((val) => (Array.isArray(val) ? val : [val]));

export const splitAndCoerceToStringArray = z
	.string()
	.min(1)
	.transform((val) => val.split(',').map((item) => item.trim()));
