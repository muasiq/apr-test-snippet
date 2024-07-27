import { AdditionalDropdownConfigurationInput } from '~/server/api/routers/organization/organization.inputs';

export const defaultConfig: AdditionalDropdownConfigurationInput = {
	attachmentOptions: [
		'A1C',
		'ABN',
		'ADMIT 3071',
		'ADMIT 3074',
		'ADVANCE DIRECTIVE EXCLUSION',
		'ADVANCED DIRECTIVE',
		'ATTESTATION',
		'AUTHORIZATION DOCUMENTATION',
		'BEREAVEMENT RISK ASSESSMENT DOCUMENTS',
		'CHANGE IN ATTENDING PHYSICIAN',
		'CHARITY FORMS',
		'CONTINUITY OF CARE DOCUMENT',
		'CONTRACT',
		'COVID19 VACCINATION STATUS FORM',
		'CTI- CERTIFICATION OF TERMINAL ILLNESS',
		'DISCHARGE 3071',
		'DISCHARGE FORM',
		'DNR',
		'DOCUMENTATION',
		'DPOA',
		'EOB - EXPLANATION OF BENEFITS',
		'EPISODE REALIGNMENT DOCUMENTATION',
		'F2F- HOME HEALTH',
		'F2F- HOSPICE',
		'FACE-TO-FACE',
		'FACILITY DELINEATION OF DUTIES',
		'FACILITY NOTIFICATION',
		'FALL REPORT',
		'FH RELEASE',
		'GUARDIANSHIP',
		'H&P',
		'INDIVIDUALIZED EMERGENCY PLAN (EPP)',
		'INSURANCE APPEAL',
		'INSURANCE CARD',
		'INSURANCE ELIGIBILITY DOCUMENTATION',
		'LAB RESULTS',
		'MEDICARE NON-COVERAGE (D/C)',
		'MEDICATION DISPOSAL FORM',
		'MISSED VISIT',
		'MPOA',
		'NAVIHEALTH REFERRAL',
		'NEVADA MEDICAID FORMS',
		'NH BILLING FORM',
		'NO PRIMARY CAREGIVER AGREEMENT',
		'NOE (INFORMED CONSENT)',
		'NON COVERED ITEMS',
		'NON COVERED ITEMS REQUEST FORM',
		'OTHER',
		'PALLIATIVE CARE FORM',
		'PATIENT STATEMENT',
		'PHI FORM',
		'PHOTO CONSENT FORM',
		'PHOTOGRAPH',
		'PHYSICIAN WEBSITE ENCOUNTER',
		'PHYSICIAN WEBSITE REFERRAL',
		'PRE-CLAIM REVIEW DOCUMENTATION',
		'PRE-CLAIM REVIEW DOCUMENTATION RECEIVED',
		'PROFILE PICTURE',
		'PROTOCOL',
		'QA EVENT',
		'RADIOLOGY RESULTS',
		'RECERT 3074',
		'RELEASE OF INFORMATION FORM',
		'REVERSE NON-ADMIT DOCUMENTATION',
		'REVOCATION FORM',
		'SIGNATURE FORMS',
		'SIGNATURE FORMS - FACILITY AND HOS DECLINATION',
		'SIGNATURE FORMS - HOS PRIMARY CAREGIVER AGREEMENT',
		'SIGNATURE FORMS - HOS TEXAS MEDICAID FORM',
		'SIGNATURE FORMS -HOS FACILITY NOTIFICATION',
		'SIGNED INITIAL POC ORDER',
		'SIGNED ORDERS',
		'SIGNED PAPER CONSENTS',
		'SIGNED RECERT ORDER',
		'SIGNED- OT POC',
		'SIGNED- PT POC',
		'SIGNED- ST POC',
		'SMOKING/ O2 RISK',
		'TRANSFER FORM',
		'TRANSITION PATIENT DOCUMENTS',
		'UPDATE 3071',
		'VISIT NOTE',
		'VOLUNTEER DOCUMENTATION',
		'WORKSHEET FOR APPROPRIATENESS',
		'WOUND IMAGE',
	],
	attachmentLocations: ['CLIENT', 'CLIENT-SIGNATURE FORMS', 'EPISODE', 'EPISODE - VISIT'],
	serviceLocations: [
		'Patient Home Residence',
		'Assisted Living Facility',
		'Skilled Nursing Facility',
		'Home Care In a Hospice Facility',
		'Inpatient Hospice Facility',
		'Inpatient Hospital',
		'Long-Term Care Hospital',
		'Nursing Long-Term Care Or Non Skilled Nursing Facility',
		'Psychiatric Facility',
		'Place Not Otherwise Specified',
	],
	patientContactRelationship: [
		'Adopted Child',
		'Aunt',
		'Brother',
		'Brother-in-law',
		'Child/Insured does not have financial responsibility',
		'Child/Insured has financial responsibility',
		'Cousin',
		'Daughter',
		'Daughter-in-law',
		'Domestic Partner',
		'Employee',
		'Father',
		'Foster Child',
		'Friend',
		'Granddaughter',
		'Grandfather',
		'Grandmother',
		'Grandson',
		'Guardian',
		'Handicapped Dependent',
		'Life Partner',
		'Mother',
		'Neighbor',
		'Nephew',
		'Niece',
		'Other',
		'Paid Caregiver',
		'Paid Caregiver (Non-Familial)',
		'Self',
		'Significant Other',
		'Sister',
		'Sister-in-law',
		'Son',
		'Son-in-law',
		'Sponsored Dependent',
		'Spouse',
		'Stepchild',
		'Uncle',
		'Unknown',
		'Ward',
		'Unknown Relationship',
	],
	patientContactAvailability: [
		'24/7',
		'Evenings and Weekends',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday',
		'Unknown Availability Type',
	],
	payorType: [
		'Pharmacy',
		'Medicaid',
		'Medicare',
		'Commercial Insurance',
		'Charity',
		'Managed Medicare FFS',
		'Workers Comp',
		'Medicare Advantage',
		'Unknown Payor Source',
	],
	facilityType: ['Facility', 'Hospital', 'Clinic', 'Other'],
	advanceDirectiveType: [
		'Do Not Resuscitate',
		'Living Will',
		'Durable Power of Attorney',
		'Mental Health Declaration',
		'Medical Power of Attorney',
	],
	advanceDirectiveContents: [
		'N/A',
		'Comfort Measures Only',
		'No Dialysis',
		'No Fluids, IV Meds',
		'No Mechanical Ventilation',
		'No Medications',
		'No Resuscitation',
		'No Tube Feedings',
	],
	emergencyContactType: ['Emergency Contact', 'Primary Caregiver', 'Power Of Attorney', 'Legal Representative'],
	supplyDeliveryMethod: [
		'From vendor for client, ship to client',
		'From vendor for client, ship to agent',
		'From vendor for client, ship to branch',
		'From stock room to client',
	],
	vaccinationType: [
		'TIV (INACTIVATED)',
		'LAIV (LIVE VIRUS)',
		'PPV',
		'MRNA-MULTIDOSE #1',
		'MRNA-MULTIDOSE #2',
		'RNA-SINGLE DOSE',
	],
	vaccinationSource: [
		'THIS AGENCY',
		"CLIENT'S PHYSICIAN",
		'HEALTH CARE CLINIC',
		'HEALTH FAIR',
		'OTHER HEALTH CARE PROVIDER',
		'PHARMACY',
	],
	medicationFrequency: [
		'DAILY',
		'EVERY OTHER DAY',
		'WEEKLY',
		'EVERY OTHER WEEK',
		'MONTHLY',
		'2 TIMES DAILY',
		'3 TIMES DAILY',
		'4 TIMES DAILY',
		'AS NEEDED',
		'BEDTIME',
		'2 TIMES A WEEK',
		'3 TIMES A WEEK',
		'4 TIMES A WEEK',
		'EVERY AM',
		'EVERY PM',
		'HOURLY',
		'EVERY 2 HOURS',
		'EVERY 4 HOURS',
		'EVERY 6 HOURS',
		'EVERY 8 HOURS',
		'EVERY 12 HOURS',
		'INTERMITTENT',
		'AS DIRECTED',
		'EVERY 72 HOURS',
		'DAILY PRN',
		'2 TIMES DAILY PRN',
		'3 TIMES DAILY PRN',
		'4 TIMES DAILY PRN',
		'DAILY X 3 DAYS PRN',
		'EVERY 12 HOURS PRN',
		'EVERY 2 HOURS PRN',
		'EVERY 4 HOURS PRN',
		'EVERY 6 HOURS PRN',
		'EVERY 8 HOURS PRN',
		'PCA - CONTINUOUS',
		'IV CONTINUOUS',
		'O2 - CONTINUOUS',
		'O2 - NIGHTLY',
		'O2 - PRN',
	],
	medicationRoute: [
		'EAR-BOTH',
		'EAR-RIGHT',
		'EAR-LEFT',
		'INTRAMUSCULAR',
		'INTRATRACHEAL',
		'INTRAVENOUS',
		'NASOGASTRIC TUBE',
		'NASAL',
		'EYE-LEFT',
		'EYE-BOTH',
		'EYE-RIGHT',
		'BY MOUTH',
		'RECTAL',
		'SUBCUTANEOUS',
		'SUBLINGUAL',
		'TOPICALLY',
		'SWISH & SWALLOW',
		'INHALATION',
		'G-TUBE',
		'O2 - NASAL CANNULA',
		'O2 - VENTI-MASK',
		'O2 - PARTIAL REBREATHER MASK',
		'O2 - NON-BREATHER MASK',
	],
	additionalMedicationDescriptors: ['Agency Administered', 'High Risk', 'None of These'],
};
