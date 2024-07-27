import * as PatientAlternatePhoneNumber from '~/assessments/apricot/data-renderers/PatientAlternatePhoneNumber';
import * as PatientMobilePhoneNumber from '~/assessments/apricot/data-renderers/PatientMobilePhoneNumber';
import * as Branch from './Branch';
import * as DateOfBirth from './DateOfBirth';
import * as DriveEndTime from './DriveEndTime';
import * as DriveStartTime from './DriveStartTime';
import * as DriveTime from './DriveTime';
import * as Gender from './Gender';
import * as Mileage from './Mileage';
import * as Name from './Name';
import * as PatientAddress from './PatientAddress';
import * as PatientAssociatedPhysicians from './PatientAssociatedPhysicians';
import * as PatientCaseManager from './PatientCaseManager';
import * as PatientEmergencyContacts from './PatientEmergencyContacts';
import * as PatientPayorDetails from './PatientPayorDetails';
import * as PatientPhoneNumber from './PatientPhoneNumber';
import * as PatientReferralSource from './PatientReferralSource';
import * as PhysicianOrderedSOCDate from './PhysicianOrderedSOCDate';
import * as ReferralDate from './ReferralDate';
import * as SocVisitDate from './SocVisitDate';
import * as SocVisitEndTime from './SocVisitEndTime';
import * as SocVisitStartTime from './SocVisitStartTime';
import * as SocialSecurityNumber from './SocialSecurityNumber';
import * as TimeInHome from './TimeInHome';
import * as VitalSignMeasurementTime from './VitalSignsMeasurementTime';

import { SerializedGroup, SerializedQuestion } from '../visit-note/serializeConfig';
import { PatientDataProps } from './PatientDataProps';
import { DataRendererOptions } from './options';

type DataRenderer = {
	getSerializedValue: (props: PatientDataProps) => SerializedGroup | SerializedQuestion;
	Input: (props: PatientDataProps) => JSX.Element | null;
};

export const DataRendererLookup: Record<DataRendererOptions, DataRenderer> = {
	[DataRendererOptions.SOCIAL_SECURITY_NUMBER]: SocialSecurityNumber,
	[DataRendererOptions.BRANCH]: Branch,
	[DataRendererOptions.DATE_OF_BIRTH]: DateOfBirth,
	[DataRendererOptions.DRIVE_TIME]: DriveTime,
	[DataRendererOptions.GENDER]: Gender,
	[DataRendererOptions.MILEAGE]: Mileage,
	[DataRendererOptions.NAME]: Name,
	[DataRendererOptions.PATIENT_ADDRESS]: PatientAddress,
	[DataRendererOptions.PATIENT_ASSOCIATED_PHYSICIANS]: PatientAssociatedPhysicians,
	[DataRendererOptions.PATIENT_CASE_MANAGER]: PatientCaseManager,
	[DataRendererOptions.PATIENT_EMERGENCY_CONTACTS]: PatientEmergencyContacts,
	[DataRendererOptions.PATIENT_PAYOR_DETAILS]: PatientPayorDetails,
	[DataRendererOptions.PATIENT_PHONE_NUMBER]: PatientPhoneNumber,
	[DataRendererOptions.PATIENT_MOBILE_PHONE_NUMBER]: PatientMobilePhoneNumber,
	[DataRendererOptions.PATIENT_ALTERNATE_PHONE_NUMBER]: PatientAlternatePhoneNumber,
	[DataRendererOptions.PATIENT_REFERRAL_SOURCE]: PatientReferralSource,
	[DataRendererOptions.SOC_VISIT_DATE]: SocVisitDate,
	[DataRendererOptions.SOC_VISIT_START_TIME]: SocVisitStartTime,
	[DataRendererOptions.TIME_IN_HOME]: TimeInHome,
	[DataRendererOptions.REFERRAL_DATE]: ReferralDate,
	[DataRendererOptions.PHYSICIAN_ORDERED_SOC_DATE]: PhysicianOrderedSOCDate,
	[DataRendererOptions.DRIVE_START_TIME]: DriveStartTime,
	[DataRendererOptions.DRIVE_END_TIME]: DriveEndTime,
	[DataRendererOptions.SOC_VISIT_END_TIME]: SocVisitEndTime,
	[DataRendererOptions.VITAL_SIGNS_MEASUREMENT_TIME]: VitalSignMeasurementTime,
};
