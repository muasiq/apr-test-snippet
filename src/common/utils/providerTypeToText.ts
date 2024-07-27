import { ProviderType } from '@prisma/client';

export const providerTypeToText = (providerType: ProviderType) => {
	switch (providerType) {
		case ProviderType.PrimaryCareProvider:
			return 'Primary Care Provider';
		case ProviderType.ReferringPhysician:
			return 'Referring Physician';
		case ProviderType.Specialist:
			return 'Specialist';
		case ProviderType.OtherFollowingPhysician:
			return 'Other Following Physician';
		default:
			return 'Unknown Provider Type';
	}
};
