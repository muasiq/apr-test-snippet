import { z } from 'zod';

export const deviceInfoSchema = z.object({
	browser: z.string().nullish(),
	os: z.string().nullish(),
	userAgent: z.string(),
	timezone: z.string(),
	lang: z.string(),
	screenResolution: z.string(),
	isTouchDevice: z.boolean(),
});

export type DeviceInfo = z.infer<typeof deviceInfoSchema>;

export const getDeviceInfo = (): DeviceInfo => {
	if (!navigator || !window) {
		throw new Error('This function is only available in the browser');
	}

	let browser, os;

	const browserRegexes = [/(Firefox)/, /(Chrome)/, /(Safari)/, /(Edge)/, /(Opera)/, /(MSIE|Trident)/];

	const osRegexes = [/(Windows)/, /(Mac OS X)/, /(Linux)/, /(iOS|iPhone|iPad|iPod)/, /(Android)/, /(Windows Phone)/];

	for (const regex of browserRegexes) {
		if (regex.test(navigator.userAgent)) {
			browser = regex.exec(navigator.userAgent)?.[0];
			break;
		}
	}

	for (const regex of osRegexes) {
		if (regex.test(navigator.userAgent)) {
			os = regex.exec(navigator.userAgent)?.[0];
			break;
		}
	}

	return {
		browser,
		os,
		userAgent: navigator.userAgent,
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		lang: navigator.language,
		screenResolution: `${window.screen.width}x${window.screen.height}`,
		isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
	};
};
