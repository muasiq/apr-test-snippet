import capitalizedTexts from './capitalized-texts.json';
import oasisItemsToRemove from './oasis-items-to-remove.json';
import textsToRemove from './texts-to-remove.json';
import textsToTransform from './texts-to-transform.json';
import titleCaseTexts from './titlecase-texts.json';

export const regexPatterns = {
	questionType: /([?:) ])\s*(?:\((?:mark|select) all that apply\) )?type: (?:list|numeric|text|date).*/i,
	leadingParentheses: /^\s*(\([^)]+\)\s*)+/,
	textBetweenColons: /:(.*?):/i,
	leadingNumbers: /^\d+\s+[:-]\s(?=\D)/,
};

const defaultLowercaseWords = [
	'A',
	'An',
	'The',
	'And',
	'But',
	'Or',
	'For',
	'Nor',
	'As',
	'At',
	'By',
	'For',
	'From',
	'In',
	'Into',
	'Near',
	'Of',
	'On',
	'Onto',
	'To',
	'With',
];

export function cleanUpQuestionText(s: string) {
	let modifiedText = s.replace(regexPatterns.questionType, '$1').toUpperCase().trim();
	modifiedText = modifiedText.replace(/  +/g, ' '); // remove extra spaces
	for (const { Original, Cleaned } of textsToTransform) {
		if (modifiedText.toLowerCase() === Original.toLowerCase()) {
			modifiedText = Cleaned;
		} else {
			const match = new RegExp(`\\b${escapeRegExp(Original)}\\b`);
			modifiedText = modifiedText.replace(match, Cleaned);
		}
	}
	for (const item of textsToRemove) {
		modifiedText = modifiedText.replace(item, '').trim();
	}
	modifiedText = modifiedText.replace(regexPatterns.leadingParentheses, '');

	modifiedText = modifiedText.replace(/in centimeters \(cm\)/i, '');
	modifiedText = modifiedText.replace(/Indicate size /i, 'Indicate size, in centimeters (cm), ');
	modifiedText = modifiedText.replace(/Indicate length /i, 'Indicate length, in centimeters (cm), ');

	if (!modifiedText.toLowerCase().includes('e.g.')) {
		modifiedText = modifiedText.replace(regexPatterns.textBetweenColons, (...matches) => {
			const text = (matches as string[])[1]?.trim();
			return ` (e.g. ${text}):`;
		});
	}
	modifiedText = modifiedText.replaceAll('--', '-');
	modifiedText = modifiedText.replace(/-\s/g, ': '); // replace hyphen with colon if followed by space
	modifiedText = modifiedText.replace(/\s([:;,.?])/g, '$1'); // remove space before punctuation
	modifiedText = modifiedText.replace(/([:;,?])(\S)/g, '$1 $2'); // add space after punctuation (except .)
	modifiedText = modifiedText.replace(/([.])(?!\d)(?![e.g])(\S)/g, '$1 $2'); // add space after . if not followed by digit and not e.g
	modifiedText = modifiedText.replace(/\s\/\s/g, '/'); // remove space around slash

	if (modifiedText.endsWith(';') || modifiedText.endsWith('.')) {
		//If a semicolon appears at the end of a question, replace it with a colon.
		modifiedText = modifiedText.slice(0, -1) + ':';
	}

	if (!modifiedText.endsWith(':') && !modifiedText.endsWith('?')) {
		//If a question does not end in either a colon or question mark, add a colon to the end
		modifiedText += ':';
	}

	modifiedText = convertQuestionTextWithColon(modifiedText);

	capitalizedTexts.forEach((item) => {
		const regex = new RegExp('\\b' + item + '\\b', 'gi');
		modifiedText = modifiedText.replace(regex, item);
	});
	titleCaseTexts.forEach((item) => (modifiedText = modifiedText.replace(item.toLowerCase(), item)));
	modifiedText = modifiedText.replace(/  +/g, ' '); // remove extra spaces again
	return modifiedText.charAt(0).toUpperCase() + modifiedText.substring(1);
}
function escapeRegExp(text: string) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function cleanUpResponseText(s: string) {
	let modifiedText = s.trim();

	for (const item of textsToRemove) {
		modifiedText = modifiedText.replace(item, '').trim();
	}

	modifiedText = modifiedText.replace(regexPatterns.leadingParentheses, '');
	modifiedText = modifiedText.replace(regexPatterns.leadingNumbers, '');
	modifiedText = modifiedText.replace(/  +/g, ' ');
	modifiedText = modifiedText.replace(/\s\/\s/g, '/'); // remove spaces around slashes

	modifiedText = modifiedText.toLowerCase();

	if (
		(modifiedText.split(' ').length < 6 ||
			modifiedText.toLowerCase() === 'not appropriate at time of evaluation') &&
		!modifiedText.endsWith('.')
	) {
		modifiedText = makeTitleCase(modifiedText);
	}
	if (['?', '.', '!', ')'].some((item) => modifiedText.endsWith(item))) {
		modifiedText = makeSentenceCase(modifiedText);
	}
	if (modifiedText.includes(' - ')) {
		const parts = modifiedText.split(' - ', 2);
		parts[0] = makeTitleCase(parts[0]!.trim());
		parts[1] = makeSentenceCase(parts[1]!.trim());
		modifiedText = parts.join(' - ');
	}

	capitalizedTexts.forEach((item) => {
		const regex = new RegExp('\\b' + item.replaceAll('.', '\\.') + '\\b', 'gi');
		modifiedText = modifiedText.replace(regex, item);
	});

	titleCaseTexts.forEach((item) => (modifiedText = modifiedText.replace(item.toLowerCase(), item)));
	modifiedText = matchSlashedItemsCase(modifiedText);

	return modifiedText;
}

export function oasisItemToBeRemoved(text: string) {
	return oasisItemsToRemove.find((item) => text.startsWith(item));
}

export function convertQuestionTextWithColon(text: string) {
	let modifiedCase = text;
	const lowercaseText = text.toLowerCase();
	if (text.includes(':') && !text.endsWith(':')) {
		const parts = text.split(':', 2);
		parts[0] = makeTitleCase(parts[0]!.trim());
		parts[1] = makeSentenceCase(parts[1]!.trim());
		modifiedCase = parts.join(': ');
	}
	if (!['you', 'your', 'yourself'].some((item) => lowercaseText.includes(item))) {
		return makeSentenceCase(text);
	}

	if (lowercaseText.endsWith(':')) {
		const startsWithText = ['describe', 'what reactions'].some((item) => lowercaseText.startsWith(item));
		modifiedCase = modifiedCase.substring(0, modifiedCase.length - 1) + (startsWithText ? '.' : '...');
	}
	if (lowercaseText.includes('ask patient:')) {
		modifiedCase = modifiedCase.replace(/ask patient: "([^"]+)["”]/i, '$1');
	}
	return `Indicate the patient's response to the following question: "${makeSentenceCase(modifiedCase)}"`;
}

export function matchSlashedItemsCase(text: string) {
	return text
		.split(' ')
		.map((word) => {
			if (word.includes('/') && !capitalizedTexts.includes(word.toUpperCase())) {
				const parts = word.split('/');
				const firstChar = parts[0]!.charAt(0);
				const secondChar = parts[1]!.charAt(0);
				if (firstChar === firstChar.toUpperCase() || secondChar === secondChar.toUpperCase()) {
					return parts.map((part) => makeTitleCase(part)).join('/');
				}
				return parts.map((part) => part.toLowerCase()).join('/');
			}
			return word;
		})
		.join(' ');
}

export function updateResponseCase(text: string) {
	const modifiedCase = text;
	const lowercaseText = text.toLowerCase();
	if (!['you', 'your', 'yourself'].some((item) => lowercaseText.includes(item))) {
		return modifiedCase;
	}
	return `Indicate the patient's response to the following question: "${modifiedCase}"`;
}

export function makeSentenceCase(text: string) {
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function makeTitleCase(text: string) {
	const words = text.split(' ');
	const titleCase = words.map((word, index) => {
		if (index !== 0 && defaultLowercaseWords.map((w) => w.toLowerCase()).includes(word.toLowerCase())) {
			return word.toLowerCase();
		}
		return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	});
	return titleCase.join(' ');
}
