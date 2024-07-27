import { faker } from '@faker-js/faker';
import { Gender, ProviderType, ReferringPhysician, State } from '@prisma/client';
import {
	onsetOrExacerbationOptions,
	symptomControlRatingOptions,
} from '~/features/screens/Field/PatientDetail/components/Assessment/QuestionTypes/AssessmentDiagnosisForm/assessmentDiagnosisForm.utils';
import type { CreatePatientInput } from '~/server/api/routers/patient/patient.inputs';
import { defaultConfig } from '../../../prisma/defaultOrgProfileSettings';

export function generateFakePatient(locationId: number): CreatePatientInput {
	const physicianOrderedSOCDateNA = faker.datatype.boolean();
	const socialSecurityUnknown = faker.datatype.boolean();

	return {
		EMRIdentifier: faker.string.numeric(6),
		physicianOrderedSOCDateNA,
		physicianOrderedSOCDate: physicianOrderedSOCDateNA ? null : new Date(),
		firstName: faker.person.firstName(),
		middleName: faker.datatype.boolean() ? faker.person.middleName() : null,
		lastName: faker.person.lastName(),
		suffix: faker.datatype.boolean() ? faker.person.suffix() : null,
		address1: faker.location.streetAddress(),
		city: faker.location.city(),
		county: faker.location.county(),
		state: faker.helpers.enumValue(State),
		zip: faker.location.zipCode(),
		phoneNumber: faker.string.numeric(10),
		locationId,
		serviceLocationType: faker.helpers.arrayElement(defaultConfig.serviceLocations),
		dateOfBirth: faker.date.birthdate(),
		gender: faker.helpers.enumValue(Gender),
		M0150Answer: ['05'],
		PatientReferralSource: {
			contactName: faker.person.fullName(),
			contactPhone: faker.string.numeric(10),
			facilityName: faker.company.name(),
			facilityType: faker.helpers.arrayElement(defaultConfig.facilityType),
			referralDate: faker.date.recent(),
			socDate: faker.date.future(),
		},
		checkedResponse: {
			choice: {
				diagnoses: [
					{
						diagnosisCode: 'A00.0',
						diagnosisDescription: 'Cholera due to Vibrio cholerae 01, biovar cholerae',
						symptomControlRating: symptomControlRatingOptions[0]!,
						dateOfOnsetOrExacerbation: new Date('2024-05-24'),
						onsetOrExacerbation: onsetOrExacerbationOptions[0]!,
					},
				],
			},
		},
		SOCVisitDate: new Date(),
		PayorSources: [
			{
				payorSourceIdentifier: faker.string.alphanumeric(5),
				payorSourceName: faker.company.name(),
				payorSourceType: faker.helpers.arrayElement(defaultConfig.payorType),
			},
		],
		socialSecurityUnknown,
		socialSecurityNumber: socialSecurityUnknown ? null : faker.string.numeric(9),
		PatientAssociatedPhysicians: [
			{
				name: faker.person.fullName(),
				phone: faker.string.numeric(10),
				providerType: ProviderType.PrimaryCareProvider,
				referringPhysician: ReferringPhysician.NO,
			},
		],
	};
}
