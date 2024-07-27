import { options as accentraOptions } from '../../src/assessments/home-care-home-base/orgs/accentra/options';
import { options as choiceOptions } from '../../src/assessments/home-care-home-base/orgs/choice/options';
import {
	FileCreateOptions,
	uploadConfigurationToSheets,
} from '../../src/assessments/home-care-home-base/orgs/common/uploadConfigurationToSheets';
import { options as elaraOptions } from '../../src/assessments/home-care-home-base/orgs/elara/options';

// BEFORE RUNNING!!!!!
// ensure the orgs ids are correct per the environment you are running this in for the org options

// Accentra
if (true) {
	await uploadConfigurationToSheets([FileCreateOptions.SERVICE_CODES], accentraOptions);
}

// Elera
if (true) {
	await uploadConfigurationToSheets([FileCreateOptions.SERVICE_CODES], elaraOptions);
}

// Choice
if (false) {
	await uploadConfigurationToSheets(
		[FileCreateOptions.FACILITIES, FileCreateOptions.PHYSICIANS, FileCreateOptions.SUPPLIES],
		choiceOptions,
	);
}
