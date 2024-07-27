const data = [
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
			'DRESSING',
			'EAR CARE',
			'FOOT CARE',
			'HAIR CARE',
			'HOME EXERCISE PROGRAM',
			'HOTEL PERSONAL CARE',
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
		category: 'VITAL SIGNS',
		descriptions: ['B/P', 'PULSE', 'RESPIRATIONS', 'TEMPERATURE', 'WEIGHT'],
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
		category: 'SAFETY AND PERTINENT INFORMATION',
		descriptions: [
			'CONTACT PRECAUTIONS',
			'DENTURES',
			'DROPLET PRECAUTIONS',
			'FALL RISK',
			'FOOD/DRINK ALLERGIES/CONSISTENCY DEFICITS',
			'FUNCTIONAL DEFICITS (ASSISTIVE DEVICE NEEDS)',
			'HEARING STATUS',
			'LIVING SITUATION',
			'OXYGEN',
			'PATIENT FUNCTIONALLY AND COGNITIVELY ABLE TO MAKE THE CHOICE FOR ADL ACTIVITIES',
			'PRESENCE OF ANIMALS',
			'REPORT TO RN/THERAPIST',
			'STANDARD PRECAUTIONS',
			'VISION STATUS',
		],
	},
	{
		category: 'COVID SCREENING',
		descriptions: ['COVID SCREENING TOOL'],
	},
	{
		category: 'INTAKE/OUTPUT',
		descriptions: ['DATE OF LAST BM', 'INTAKE - FLUIDS', 'INTAKE - FOOD', 'OUTPUT - EMESIS', 'OUTPUT - URINE'],
	},
	{
		category: 'OTHER SERVICES',
		descriptions: ['OTHER (PLEASE DESCRIBE)'],
	},
];

// (function main() {
// 	const generatedData = generateACPDataFromResponses(data);
// 	const filePath = path.join(__dirname, '../aide-care-plan.json');
// 	fs.writeFileSync(filePath, JSON.stringify(generatedData, null, 2), 'utf-8');
// })();
