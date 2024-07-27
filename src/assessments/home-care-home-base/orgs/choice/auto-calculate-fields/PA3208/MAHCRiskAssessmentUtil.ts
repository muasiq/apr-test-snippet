export enum MAHCRiskAssessmentQuestions {
	PA3153 = 'AC2000',
	PA3156 = 'AC2001',
	PA3159 = 'AC2002',
	PA3164 = 'AC2003',
	PA3169 = 'AC2004',
	PA3175 = 'AC2005',
	PA3183 = 'AC2006',
	PA3189 = 'AC2007',
	PA3196 = 'AC2008',
	PA3201 = 'AC2009',
}

export const getMAHCRiskLevelText = (score: number) => {
	if (score >= 4) return 'AT RISK FOR FALLING';

	return 'AT LOW RISK FOR FALLING';
};
