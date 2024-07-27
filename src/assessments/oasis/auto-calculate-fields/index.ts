import * as PatientFormattedHeight from '~/assessments/oasis/auto-calculate-fields/PatientFormattedHeight';
import * as BradenRiskAssessment from '../../home-care-home-base/orgs/choice/auto-calculate-fields/PA1045/BradenRiskAssessment';
import * as NutritionalAssessment from '../../home-care-home-base/orgs/choice/auto-calculate-fields/PA2515/NutritionalAssessment';
import * as MAHCRiskAssessment from '../../home-care-home-base/orgs/choice/auto-calculate-fields/PA3208/MAHCRiskAssessment';
import * as BIMSAssessment from './C0500/BimsAssessment';
import * as MoodInterview from './D0160/MoodInterview';

import { SerializedGroup, SerializedQuestion } from '~/assessments/apricot/visit-note/serializeConfig';
import { AutoCalculateFieldResolver } from '../../util/autoCalculateFieldsUtil';
import { AutoCalculateOptions } from './options';

export const AutoCalculateMap: Record<
	AutoCalculateOptions,
	{
		Input: (props: AutoCalculateFieldResolver) => JSX.Element | null;
		getSerializedValue: (
			props: AutoCalculateFieldResolver,
		) => (SerializedGroup & { followups?: string[] }) | SerializedQuestion | undefined;
	}
> = {
	[AutoCalculateOptions.BIMS_ASSESSMENT]: BIMSAssessment,
	[AutoCalculateOptions.MOOD_INTERVIEW]: MoodInterview,
	[AutoCalculateOptions.MAHC_RISK_ASSESSMENT]: MAHCRiskAssessment,
	[AutoCalculateOptions.NUTRITIONAL_ASSESSMENT]: NutritionalAssessment,
	[AutoCalculateOptions.BRADEN_RISK_ASSESSMENT]: BradenRiskAssessment,
	[AutoCalculateOptions.PATIENT_FORMATTED_HEIGHT]: PatientFormattedHeight,
};
