const formatNum = (num: number) => num.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });

export function generateACPDataFromResponses(data: { category: string; descriptions: string[] }[]) {
	const rootQuestion = {
		id: 'ACP01',
		text: 'Is a Home Health Aide needed for this patient?',
		assessment: 'aide-care-plan',
		type: 'response',
		questionType: 'Code',
		responses: [
			{
				text: 'Yes, a Home Health Aide is ordered',
				sequence: 1,
				followup: ['ACP02'],
				code: '0',
			},
			{
				text: 'Yes, a Home Health Aide is recommended; pending physician orders',
				sequence: 2,
				followup: ['ACP02'],
				code: '1',
			},
			{
				text: 'No, a Home Health Aide is not needed',
				sequence: 3,
				code: '2',
			},
		],
	};

	const selectCategoryQuestion = {
		id: 'ACP02',
		parentId: rootQuestion.id,
		text: 'Which of the following service categories should be provided by a Home Health Aide for this patient?',
		assessment: 'aide-care-plan',
		type: 'response',
		questionType: 'Checklist',
		responses: data.map((item, i) => ({
			text: item.category.endsWith('SERVICES') ? item.category : `${item.category} MONITORING SERVICES`,
			originalText: item.category,
			code: `${i}`,
			followup: [`ACP02-${formatNum(i + 1)}`] as const,
		})),
	};

	const categoryQuestions = selectCategoryQuestion.responses.map((item, i) => {
		const [id] = item.followup;
		const catItem = data[i]!;
		return {
			id,
			parentId: selectCategoryQuestion.id,
			text: `Which of the following ${item.text} by home health aide are needed for this patient?`,
			assessment: 'aide-care-plan',
			type: 'response',
			questionType: 'Checklist',
			responses: catItem.descriptions.map((desc, j) => ({
				text: formatDescription(item.originalText, desc),
				originalText: desc,
				code: `${i}`,
				followup: [`${id}-${formatNum(j + 1)}a`, `${id}-${formatNum(j + 1)}b`] as const,
			})),
		};
	});

	const servicesQuestions = categoryQuestions
		.flatMap((item) => item.responses.map((res) => ({ itemId: item.id, ...res })))
		.flatMap((item) => {
			const [id1, id2] = item.followup;

			return [
				{
					id: id1,
					parentId: item.itemId,
					text: `Indicate the frequency with which the following home health aide assistance is needed: ${item.text}`,
					assessment: 'aide-care-plan',
					type: 'response',
					questionType: 'Code',
					responses: [
						{ text: 'Every Visit', code: '0' },
						{ text: 'Daily', code: '1' },
						{ text: 'Weekly', code: '2' },
					],
				},
				{
					id: id2,
					parentId: item.itemId,
					text: `Provide details about the need for a home health aid to ${item.text}`,
					assessment: 'aide-care-plan',
					questionType: 'Text',
				},
			];
		});

	return [rootQuestion, selectCategoryQuestion, ...categoryQuestions, ...servicesQuestions];
}

function formatDescription(category: string, description: string) {
	switch (category) {
		case 'ADL SERVICES':
			if (['ASSIST TO ', 'ASSIST WITH '].some((prefix) => description.startsWith(prefix))) {
				return description.replace(/(ASSIST TO |ASSIST WITH )/, 'PROVIDE ASSISTANCE WITH ');
			}
			return `PROVIDE ASSISTANCE WITH ${description}`;
		case 'INTAKE/OUTPUT':
			return `RECORD ${description}`;
		case 'OTHER SERVICES':
			return 'PROVIDE ' + description;
		case 'VITAL SIGNS':
			return `OBTAIN ${description}`;
		case 'SAFETY AND PERTINENT INFORMATION':
			return `TAKE PRECAUTIONS FOR ${description}`;
		default:
			return description;
	}
}

function getAideCarePlanData() {
	return [
		{
			category: 'ADL SERVICES',
			descriptions: [
				'ASSIST TO BEDSIDE COMMODE',
				'ASSIST TO TOILET',
				'ASSIST WITH BEDPAN',
				'ASSIST WITH FEEDING',
				'BATHING - BED BATH',
				'BATHING - PARTIAL SPONGE BATH',
				'BATHING - SHOWER',
				'BATHING - TUB BATH',
				'BATHING (TUB BATH/SHOWER)',
				'COVID-19 SCREENING',
				'DRESSING',
				'EAR CARE',
				'FOOT CARE',
				'HAIR CARE',
				'HOME EXERCISE PROGRAM',
				'NAIL CARE',
				'ORAL CARE',
				'PERINEAL CARE',
				'PROVIDE MEDICATION REMINDERS',
				'ROM TO LLE',
				'ROM TO LUE',
				'ROM TO RLE',
				'ROM TO RUE',
				'ROUTINE CATHETER CARE',
				'ROUTINE OSTOMY CARE',
				'SHAMPOO',
				'SHAVING',
				'SKIN CARE',
				'STAND-BY ASSISTANCE WITH AMBULATION',
				'TRANSFER CLIENT FROM BED/CHAIR',
				'TRANSFER CLIENT FROM CHAIR/BED',
				'TURN AND POSITION IN BED',
			],
		},
		{
			category: 'IADL SERVICES',
			descriptions: [
				'CHANGE LINENS',
				'EMPTY TRASH',
				'EMPTY URINAL',
				'EMPTY URINARY DRAINAGE BAG',
				'OFFER FLUIDS',
				'PREPARE MEAL',
				'PREPARE SNACK',
				'WASH LINENS',
			],
		},
		{
			category: 'INTAKE/OUTPUT',
			descriptions: ['DATE OF LAST BM', 'INTAKE - FLUIDS', 'INTAKE - FOOD', 'OUTPUT - EMESIS', 'OUTPUT - URINE'],
		},
		{
			category: 'OTHER SERVICES',
			descriptions: [
				'BLEEDING PRECAUTIONS',
				'FALL PRECAUTIONS',
				'INFECTION CONTROL PRECAUTIONS',
				'OTHER (PLEASE DESCRIBE)',
				'OXYGEN PRECAUTIONS',
				'SMOKING PRECAUTIONS',
				'STANDARD PRECAUTIONS',
			],
		},
		{ category: 'VITAL SIGNS', descriptions: ['B/P', 'PULSE', 'RESPIRATIONS', 'TEMPERATURE', 'WEIGHT'] },
	];
}

/**
INSTRUCTIONS: To transform the Aide Services csv data into a JSON format that can be used to generate the questions and responses 

ONLINE JSON_EDITOR: https://jsoneditoronline.org/

1. Import the Aide Services csv file (!! Select comma delimiter from options !!)
2. Click Transform button (>)
3. Paste the following code into query

	function query(data) {
		return data.reduce((acc, curr) => {
			const category = curr.Category;
			const existingCategory = acc.find((item) => item.category === category);
			if (existingCategory) {
				existingCategory.descriptions.push(curr.Description);
			} else {
				acc.push({
					category,
					descriptions: [curr.Description],
				});
			}
			return acc;
		}, []);
	}

 */
