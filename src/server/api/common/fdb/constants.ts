// custom map extracted from hchb
export const customDosageUnitMapping = {
	aerosol: ['puff'],
	applicator: ['applicator'],
	cream: ['cm', 'inch'],
	drops: ['drops'],
	gas: ['%', 'Liter'],
	gel: ['cm', 'inch'],
	inhaler: ['puff'],
	mist: ['puff'],
	ointment: ['cm', 'inch'],
	spray: ['spray'],
} as const;

export const medNameUnits = ['mg', 'mcg DFE'];
export const medStrengthUnits = ['%'];

export const constantUnits = ['Per instructions'];
