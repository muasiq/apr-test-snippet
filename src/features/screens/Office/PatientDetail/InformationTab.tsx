import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Stack } from '@mui/material';
import { Patient } from '@prisma/client';
import { identity, isEmpty, pickBy } from 'lodash';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Control, UseFormSetValue, useForm } from 'react-hook-form';
import { CustomAssessmentNumber } from '~/assessments/apricot/custom';
import { useCurrentWindowWidth } from '~/common/hooks/useCurrentWindowWidth';
import { isPostSignOffStatus } from '~/common/utils/patientStatusUtils';
import { trpc } from '~/common/utils/trpc';
import { FixedBottomSaveButton } from '~/features/ui/buttons/FixedBottomSaveButton';
import { LoadingSpinner } from '~/features/ui/loading/LoadingSpinner';
import { AssessmentCheckInput, AssessmentDiagnosisInput } from '~/server/api/routers/assessment/assessment.inputs';
import type { PatientWithJoins } from '~/server/api/routers/patient/patient.types';
import { useAlert } from '../../../../common/hooks/useAlert';
import { api } from '../../../../common/utils/api';
import {
	CreatePatientInput,
	UpdatePatientInput,
	updatePatientSchema,
} from '../../../../server/api/routers/patient/patient.inputs';
import { AssociatedPhysician } from '../PatientList/PatientInformation/AssociatedPhysician';
import { BasicInformation } from '../PatientList/PatientInformation/BasicInformation';
import { ContactInformation } from '../PatientList/PatientInformation/ContactInformation';
import { EmergencyContact } from '../PatientList/PatientInformation/EmergencyContact';
import { PatientDiagnosisForm } from '../PatientList/PatientInformation/PatientDiagnosisForm';
import { PayorSource } from '../PatientList/PatientInformation/PayorSource';
import { ReferralSource } from '../PatientList/PatientInformation/ReferralSource';
import { ServiceLocation } from '../PatientList/PatientInformation/ServiceLocation';
import { SocVisit } from '../PatientList/PatientInformation/SocVisit';

type Props = {
	patientData: PatientWithJoins;
};
export const InformationTab = ({ patientData }: Props): JSX.Element => {
	const alert = useAlert();
	const router = useRouter();
	const utils = trpc.useUtils();
	const { width } = useCurrentWindowWidth();
	const [loadingDefaultValues, setLoadingDefaultValues] = useState(true);
	const {
		control,
		handleSubmit,
		setValue,
		reset,
		formState: { dirtyFields },
		getValues,
	} = useForm<CreatePatientInput>({
		resolver: zodResolver(updatePatientSchema),
		defaultValues: async () => {
			const formInput = patientData as unknown as CreatePatientInput;
			const existingDiagnosesAnswer = await utils.assessment.getAssessmentQuestionForPatient.fetch({
				patientId: patientData.id,
				assessmentNumber: CustomAssessmentNumber.DIAGNOSES,
			});
			setLoadingDefaultValues(false);
			if (!existingDiagnosesAnswer) return formInput;
			const existingDiagnoses = existingDiagnosesAnswer as unknown as {
				checkedResponse: AssessmentDiagnosisInput;
			};
			return { ...formInput, checkedResponse: existingDiagnoses.checkedResponse };
		},
	});

	const additionalConfigQuery = api.organization.getAdditionalDropdownConfiguration.useQuery();

	const { mutate, isLoading } = api.patient.update.useMutation({
		onSuccess: async (data: Patient) => {
			alert.addSuccessAlert({ message: 'Successfully updated patient' });
			const updatedUser = pickBy(data, identity);
			reset(updatedUser, {
				keepValues: true,
				keepDirty: false,
				keepDefaultValues: false,
			});
			await utils.patient.getById.invalidate();
		},
		onError: (error) => {
			alert.addErrorAlert({ message: error.message ?? 'Error updating patient' });
			console.error('error updating patient', error);
		},
	});

	const { qaOpen } = router.query as { qaOpen?: string };
	const isFieldApp = router.pathname.startsWith('/field');
	const qaIsOpen = qaOpen === 'true' && !isFieldApp;

	const onSubmit = (data: CreatePatientInput) => {
		mutate({ ...data, id: patientData.id } as UpdatePatientInput);
	};

	const onError = (errors: object) => {
		console.log('errors with the form', errors);
	};

	const isPostSignOff = isPostSignOffStatus(patientData.status);

	if (loadingDefaultValues || additionalConfigQuery.isLoading || !additionalConfigQuery.data)
		return <LoadingSpinner />;

	return (
		<Stack spacing={3}>
			<BasicInformation
				control={control}
				formReadonly={isPostSignOff}
				configurationType={patientData.configurationType}
			/>
			<SocVisit control={control} formReadonly={isPostSignOff} />
			<ServiceLocation
				control={control}
				formReadonly={isPostSignOff}
				serviceLocationTypeOptions={additionalConfigQuery.data?.serviceLocations}
				getValues={getValues}
				setValue={setValue}
			/>
			<ContactInformation control={control} formReadonly={isPostSignOff} />
			<EmergencyContact
				control={control}
				formReadonly={isPostSignOff}
				emergencyContactTypeOptions={additionalConfigQuery.data.emergencyContactType}
				relationshipTypeOptions={additionalConfigQuery.data.patientContactRelationship}
				availabilityTypeOptions={additionalConfigQuery.data.patientContactAvailability}
			/>
			<PatientDiagnosisForm
				patientId={patientData.id}
				control={control as unknown as Control<AssessmentCheckInput>}
				setValue={setValue as unknown as UseFormSetValue<AssessmentCheckInput>}
				formReadonly={isPostSignOff}
			/>
			<AssociatedPhysician control={control} formReadonly={isPostSignOff} />
			<ReferralSource
				control={control}
				formReadonly={isPostSignOff}
				facilityTypeOptions={additionalConfigQuery.data.facilityType}
			/>
			<PayorSource
				control={control}
				formReadonly={isPostSignOff}
				payorSourceTypeOptions={additionalConfigQuery.data.payorType}
			/>

			{!isEmpty(dirtyFields) && <Box height={'80px'} />}
			<FixedBottomSaveButton
				show={!isEmpty(dirtyFields)}
				width={!qaIsOpen ? width : '50vw'}
				ml={!qaIsOpen ? 0 : 3}
				dataCy="update-patient-button"
				isLoading={isLoading}
				onClick={handleSubmit(onSubmit, onError)}
			/>
		</Stack>
	);
};
