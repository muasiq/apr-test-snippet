export const symptomControlRatingOptions = [
	'0 - Asymptomatic, no treatment needed at this time.',
	'1 - Symptoms well controlled with current therapy.',
	'2 - Symptoms controlled with difficulty, affecting daily functioning; patient needs ongoing monitoring.',
	'3 - Symptoms poorly controlled, patient needs frequent adjustments in treatment and dose monitoring.',
	'4 - Symptoms poorly controlled, history of re-hospitalizations.',
];

export const onsetOrExacerbationOptions = ['Onset', 'Exacerbation'];

export type Diagnosis = {
	diagnosisCode: string;
	diagnosisDescription: string;
	symptomControlRating: string;
	onsetOrExacerbation: string;
	dateOfOnsetOrExacerbation: Date;
};
