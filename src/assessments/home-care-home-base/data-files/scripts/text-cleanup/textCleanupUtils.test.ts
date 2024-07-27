import { expect, it } from '@jest/globals';
import { cleanUpQuestionText, cleanUpResponseText, matchSlashedItemsCase } from './textCleanupUtils';

describe('textCleanup and responseCleanup', () => {
	it('should have the remove type texts from question', () => {
		expect(cleanUpQuestionText('LONG QUESTION TEXT? TYPE: LIST - MULTISELECT: N')).toBe('Long question text?');
		expect(cleanUpQuestionText('LONG QUESTION TEXT: TYPE: TEXT - MULTISELECT: N')).toBe('Long question text:');
		expect(cleanUpQuestionText('LONG QUESTION TEXT: (SELECT ALL THAT APPLY) TYPE: NUMERIC - MULTISELECT: N')).toBe(
			'Long question text:',
		);
		expect(cleanUpQuestionText('LONG QUESTION TEXT: LOREM')).toBe('Long question text: lorem:');
	});
	it('should have the remove leading parenthetical texts from question', () => {
		expect(cleanUpQuestionText('(OBQI)(M0100) THIS ASSESSMENT IS')).toBe('This assessment is:');
		expect(cleanUpQuestionText('(OBQI) THIS ASSESSMENT IS')).toBe('This assessment is:');
	});
	it('should remove leading numbers from responses', () => {
		expect(cleanUpResponseText('1 - THIS ASSESSMENT IS')).toBe('This Assessment Is');
		expect(cleanUpResponseText('1-19 MILD')).toBe('1-19 Mild');
	});
	it('should have the remove text between colons from question', () => {
		expect(cleanUpQuestionText('LONG QUESTION TEXT : TEXT BETWEEN COLONS: N')).toBe(
			'Long question text (e.g. text between colons): n:',
		);
	});
	it('should update question text format', () => {
		expect(cleanUpQuestionText('INDICATE REASON-- BLOOD TEST? TYPE: LIST - MULTISELECT: N')).toBe(
			'Indicate reason: blood test?',
		);
		expect(cleanUpResponseText('text  slash / slash')).toBe('Text Slash/Slash');
	});
	it('converts question format', () => {
		expect(cleanUpQuestionText('DESCRIBE YOUR THINKING AS RELATED TO FIVE YEARS AGO:')).toBe(
			'Indicate the patient\'s response to the following question: "Describe your thinking as related to five years ago."',
		);
		expect(
			cleanUpQuestionText(
				'DIRECTIONS FOR TUG ASSESSMENT ARE FOUND IN REFERENCE SECTION.  INDICATE RESULTS IN SECONDS. TYPE: TEXT - MULTISELECT: N',
			),
		).toBe('Indicate results of TUG screen in seconds:');
		expect(cleanUpQuestionText('sample question: what is your age?')).toBe(
			'Indicate the patient\'s response to the following question: "Sample question: what is your age?"',
		);
	});
	it('should update length unit', () => {
		expect(
			cleanUpQuestionText(
				'INDICATE LENGTH OF EXPOSED PICC CATHETER FROM INSERTION SITE TO CATHETER HUB IN CENTIMETERS (CM): TYPE: NUMERIC - MULTISELECT: N',
			),
		).toBe('Indicate length, in centimeters (cm), of exposed PICC catheter from insertion site to catheter hub:');
	});
	it('should set default text case', () => {
		expect(cleanUpResponseText('SAMPLE E.G. THIS IS A SAMPLE TEXT.')).toBe('Sample e.g. this is a sample text.');
		expect(cleanUpResponseText('covid negative')).toBe('COVID Negative');
	});
	it('match slashed items case', () => {
		expect(matchSlashedItemsCase('this is a item/Item')).toBe('this is a Item/Item');
	});
});

describe('Question and response text cleanup', () => {
	it('should properly format the question text', () => {
		expect(
			cleanUpQuestionText(
				'*DOES THE PATIENT HAVE A HISTORY OF SUICIDE ATTEMPTS / GESTURES? TYPE: LIST - MULTISELECT: N',
			),
		).toBe('Does the patient have a history of suicide attempts/gestures?');
		expect(cleanUpQuestionText('Indicate weight loss (score "severe" if greater than 2.5 kg in 1 month).')).toBe(
			'Indicate weight loss (score "severe" if greater than 2.5 kg in 1 month):',
		);
		expect(cleanUpQuestionText('Indicate weight loss (score "severe" if greater than 2.A kg in 1 month).')).toBe(
			'Indicate weight loss (score "severe" if greater than 2. a kg in 1 month):',
		);
		expect(
			cleanUpQuestionText(
				'INDICATE ABNORMAL MOVEMENT OF MUSCLES OF FACIAL EXPRESSION: MOVEMENTS OF FOREHEAD, EYEBROWS, PERIORBITAL: TYPE: LIST - MULTISELECT: N',
			),
		).toBe(
			'Indicate abnormal movement of muscles of facial expression (e.g. movements of forehead, eyebrows, periorbital):',
		);

		expect(
			cleanUpQuestionText(
				"INDICATE PATIENT'S MOOD:  ANXIETY, ANXIOUS EXPRESSION, RUMINATIONS, WORRYING: TYPE: LIST - MULTISELECT: N",
			),
		).toBe("Indicate patient's mood (e.g. anxiety, anxious expression, ruminations, worrying):");
		expect(
			cleanUpQuestionText(
				'INDICATE MULTIPLE PHYSICAL COMPLAINTS: COMPLAINS ABOUT PHYSICAL HEALTH MORE THAN IS REASONABLE (SCORE 0 IF GASTRO-INTESTIONAL SYMPTOMS ONLY): TYPE: LIST - MULTISELECT: N',
			),
		).toBe('Indicate multiple physical complaints (e.g. complains about physical health more than is reasonable):');

		expect(
			cleanUpQuestionText(
				"INDICATE PATIENT'S PHYSICAL SIGNS: APPETITE LOSS: EATING LESS THAN USUAL: TYPE: LIST - MULTISELECT: N",
			),
		).toBe("Indicate patient's physical signs (e.g. appetite loss, eating less than usual):");

		expect(
			cleanUpQuestionText('INDICATE BLUE LUMEN PATENCY (MARK ALL THAT APPLY): TYPE: LIST - MULTISELECT: Y'),
		).toBe('Indicate blue lumen patency:');
		expect(
			cleanUpQuestionText(
				'CRANIAL NERVE VII: FACIAL (MOTOR)(BILATERAL)/ TONGUE (TASTE- 2/3 OF TONGUE) TYPE: LIST - MULTISELECT: N',
			),
		).toBe('Cranial nerve VII: facial (motor)(bilateral)/ tongue (taste: 2/3 of tongue):');
		expect(cleanUpQuestionText("IS THE PATIENT'S INTELLECT INTACT? TYPE: LIST - MULTISELECT: N")).toBe(
			"Is the patient's intellect intact?",
		);

		expect(
			cleanUpQuestionText(
				'DO YOU WANT TO USE THE CORNELL SCALE FOR DEMENTIA PATIENTS? TYPE: LIST - MULTISELECT: N',
			),
		).toBe('Did the clinician use the Cornell Scale for dementia patients?');
	});
	it('should properly format the respose text', () => {
		expect(cleanUpResponseText('YES (SCORE ONE POINT)')).toBe('Yes');
		expect(cleanUpResponseText('SLEEPING LESS THAN NORMAL AMOUNT BY UP TO 1 HOUR')).toBe(
			'sleeping less than normal amount by up to 1 hour',
		);
		expect(cleanUpResponseText('TUB CHAIR')).toBe('Tub Chair');
		expect(cleanUpResponseText('Church of Christ')).toBe('Church of Christ');
		expect(cleanUpResponseText('The Use of Special Transportation')).toBe('The Use of Special Transportation');

		expect(cleanUpResponseText('REGULATORY INFORMATION (PATIENT RIGHTS, ADVANCE DIRECTIVES, ETC.)')).toBe(
			'Regulatory information (patient rights, Advance Directives, etc.)',
		);
		expect(cleanUpResponseText('3 - NETS/MITS (TRANSPORTATION SERVICES)')).toBe(
			'NETS/MITS (transportation services)',
		);
	});
});
