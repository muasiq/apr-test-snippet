import { Stack } from '@mui/material';
import { useSession } from 'next-auth/react';
import { api } from '~/common/utils/api';
import { UserActionPermissions, hasActionPermission } from '~/common/utils/permissions';
import { AdditionalDropdownConfiguration } from '~/features/screens/Office/Admin/OrgProfile/EMRConfiguration/AdditionalDropdownConfiguration.tsx';
import { AdditionalEvaluationServiceCodes } from '~/features/screens/Office/Admin/OrgProfile/EMRConfiguration/AdditionalEvaluationServiceCodes';
import { AttachmentTypes } from '~/features/screens/Office/Admin/OrgProfile/EMRConfiguration/AttachmentType';
import { PhysicalAssessmentCategories } from '~/features/screens/Office/Admin/OrgProfile/EMRConfiguration/PhysicalAssessmentCategories';
import { SkilledNursingServiceCodes } from '~/features/screens/Office/Admin/OrgProfile/EMRConfiguration/SkilledNursingServiceCodes';
import { Supplies } from '~/features/screens/Office/Admin/OrgProfile/EMRConfiguration/Supplies';
import { VitalSignConfig } from '~/features/screens/Office/Admin/OrgProfile/EMRConfiguration/VitalSignConfig';
import { LoadingSpinner } from '~/features/ui/loading/LoadingSpinner';

export function EMRConfiguration(): JSX.Element {
	const { data: session } = useSession();

	const additionalDropdownConfigurationQuery = api.organization.getAdditionalDropdownConfiguration.useQuery();

	const hasAttachmentTypePermission = hasActionPermission(
		UserActionPermissions.MANAGE_ATTACHMENT_TYPES,
		session?.user.roles,
	);
	const hasPhysicalAssessmentPermission = hasActionPermission(
		UserActionPermissions.MANAGE_PHYSICAL_ASSESSMENT_CATEGORIES,
		session?.user.roles,
	);

	if (additionalDropdownConfigurationQuery.isLoading || !additionalDropdownConfigurationQuery.data) {
		return <LoadingSpinner />;
	}

	return (
		<>
			<Stack direction={{ xs: 'column' }} spacing={{ xs: 4, sm: 6 }}>
				{hasAttachmentTypePermission ? (
					<>
						<AttachmentTypes
							hchbAttachmentLocations={
								additionalDropdownConfigurationQuery.data?.attachmentLocations ?? []
							}
							hchbAttachmentTypes={additionalDropdownConfigurationQuery.data?.attachmentOptions ?? []}
						/>
						<SkilledNursingServiceCodes />
						<AdditionalEvaluationServiceCodes />
					</>
				) : null}
				{hasPhysicalAssessmentPermission ? <PhysicalAssessmentCategories /> : null}
				<VitalSignConfig />
				<Supplies />
				<AdditionalDropdownConfiguration
					additionalDropdownConfiguration={additionalDropdownConfigurationQuery.data}
				/>
			</Stack>
		</>
	);
}
