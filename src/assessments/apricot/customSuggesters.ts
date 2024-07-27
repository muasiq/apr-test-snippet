import { additionalEvaluationSuggestion } from '~/server/api/common/anthropic/additionalEvaluationSuggestion';
import { advanceDirectivesSuggestion } from '~/server/api/common/anthropic/advanceDirectivesSuggestion';
import { facilitiesSuggestion } from '~/server/api/common/anthropic/facilitiesSuggestion';
import { homeHealthAideVisitFrequenciesSuggestion } from '~/server/api/common/anthropic/homeHealthAideVisitFrequenciesSuggestion';
import { skilledNursingVisitFrequenciesSuggestion } from '~/server/api/common/anthropic/skilledNursingVisitFrequenciesSuggestion';
import { vitalSignParamsSuggestion } from '~/server/api/common/anthropic/vitalSignParamsSuggestion';
import { carePlanSuggestion } from '../../server/api/common/anthropic/care-plan/carePlanSuggestion';
import { diagnosesSuggestion } from '../../server/api/common/anthropic/diagnosesSuggestion';
import { medAdministrationSuggestion } from '../../server/api/common/anthropic/medAdministrationSuggestion';
import { medicationsSuggestion } from '../../server/api/common/anthropic/medications';
import { proceduresSuggestion } from '../../server/api/common/anthropic/proceduresSuggestion';
import { supplyListSuggestion } from '../../server/api/common/anthropic/supplyListSuggestion';
import { vaccinationsSuggestion } from '../../server/api/common/anthropic/vaccinationSuggestion';
import { CustomSuggesters } from './custom';

export const customSuggestors = {
	[CustomSuggesters.MEDICATION]: medicationsSuggestion,
	[CustomSuggesters.VACCINATION]: vaccinationsSuggestion,
	[CustomSuggesters.CARE_PLAN]: carePlanSuggestion,
	[CustomSuggesters.SUPPLY_LIST]: supplyListSuggestion,
	[CustomSuggesters.ADVANCE_DIRECTIVES]: advanceDirectivesSuggestion,
	[CustomSuggesters.MEDICATION_ADMINISTRATION]: medAdministrationSuggestion,
	[CustomSuggesters.DIAGNOSIS]: diagnosesSuggestion,
	[CustomSuggesters.SKILLED_NURSING_VISIT_FREQUENCIES]: skilledNursingVisitFrequenciesSuggestion,
	[CustomSuggesters.HOME_HEALTH_AIDE_VISIT_FREQUENCIES]: homeHealthAideVisitFrequenciesSuggestion,
	[CustomSuggesters.PROCEDURES]: proceduresSuggestion,
	[CustomSuggesters.ADDITIONAL_EVALUATION]: additionalEvaluationSuggestion,
	[CustomSuggesters.FACILITIES]: facilitiesSuggestion,
	[CustomSuggesters.VITAL_SIGN_PARAMETERS]: vitalSignParamsSuggestion,
};
