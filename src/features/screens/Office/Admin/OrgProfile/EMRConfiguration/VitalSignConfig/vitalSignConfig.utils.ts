import type { VitalSignConfigFormInput } from '~/server/api/routers/organization/organization.inputs';

type VitalSignConfigRecord = {
	[P in keyof Omit<VitalSignConfigFormInput['configs'][number], 'id' | 'name'>]-?: unknown;
};
export type VitalSignConfigKey = keyof VitalSignConfigRecord;
export type VitalSignFieldsGroup = {
	group: string;
	fields: Array<{ name: VitalSignConfigKey; label: string }>;
};

export const DEFAULT_VITAL_SIGN_CONFIG_NAME = 'Default Configuration';

export const vitalSignParamFieldGroups: VitalSignFieldsGroup[] = [
	{
		group: 'Temperature',
		fields: [
			{ name: 'temperatureMin', label: 'Temperature Min (°F)' },
			{ name: 'temperatureMax', label: 'Temperature Max (°F)' },
		],
	},
	{
		group: 'Pulse',
		fields: [
			{ name: 'pulseMin', label: 'Pulse(bpm) Min' },
			{ name: 'pulseMax', label: 'Pulse(bpm) Max' },
		],
	},

	{
		group: 'Respirations',
		fields: [
			{ name: 'respirationsMin', label: 'Respirations Min (bpm)' },
			{ name: 'respirationsMax', label: 'Respirations Max (bpm)' },
		],
	},

	{
		group: 'O2 Saturation',
		fields: [
			{ name: 'oxygenSaturationMin', label: 'O2 Saturation Min (%)' },
			{ name: 'oxygenSaturationMax', label: 'O2 Saturation Max (%)' },
		],
	},
	{
		group: 'Pain Level',
		fields: [
			{ name: 'painLevelMin', label: 'Pain Level Min' },
			{ name: 'painLevelMax', label: 'Pain Level Max' },
		],
	},
	{
		group: 'Weight',
		fields: [
			{ name: 'weightMin', label: 'Weight Min (lbs)' },
			{ name: 'weightMax', label: 'Weight Max (lbs)' },
		],
	},
	{
		group: 'Blood Pressure',
		fields: [
			{ name: 'bloodPressureSystolicMin', label: 'Systolic BP Min (mmHg)' },
			{ name: 'bloodPressureSystolicMax', label: 'Systolic BP Max (mmHg)' },
			{ name: 'bloodPressureDiastolicMin', label: 'Diastolic BP Min (mmHg)' },
			{ name: 'bloodPressureDiastolicMax', label: 'Diastolic BP Max (mmHg)' },
		],
	},
	{
		group: 'Blood Sugar',
		fields: [
			{ name: 'fastingBloodSugarMin', label: 'Fasting Blood Sugar Min (mg/dL)' },
			{ name: 'fastingBloodSugarMax', label: 'Fasting Blood Sugar Max (mg/dL)' },
			{ name: 'randomBloodSugarMin', label: 'Random Blood Sugar Min (mg/dL)' },
			{ name: 'randomBloodSugarMax', label: 'Random Blood Sugar Max (mg/dL)' },
		],
	},

	{
		group: 'INR Level',
		fields: [
			{ name: 'inrLevelMin', label: 'INR Level Min' },
			{ name: 'inrLevelMax', label: 'INR Level Max' },
		],
	},
	{
		group: 'Prothrombin Time',
		fields: [
			{ name: 'prothrombinTimeMin', label: 'Prothrombin Time Min' },
			{ name: 'prothrombinTimeMax', label: 'Prothrombin Time Max' },
		],
	},
	{
		group: 'Ankle Circumference',
		fields: [
			{ name: 'ankleCircumferenceMin', label: 'Ankle Circumference Min (cm)' },
			{ name: 'ankleCircumferenceMax', label: 'Ankle Circumference Max (cm)' },
		],
	},
	{
		group: 'Calf Circumference',
		fields: [
			{ name: 'calfCircumferenceMin', label: 'Calf Circumference Min (cm)' },
			{ name: 'calfCircumferenceMax', label: 'Calf Circumference Max (cm)' },
		],
	},
	{
		group: 'Girth',
		fields: [
			{ name: 'girthMin', label: 'Girth Max (cm)' },
			{ name: 'girthMax', label: 'Girth Max (cm)' },
		],
	},
	{
		group: 'Head Circumference',
		fields: [
			{ name: 'headCircumferenceMin', label: 'Head Circumference Min (cm)' },
			{ name: 'headCircumferenceMax', label: 'Head Circumference Max (cm)' },
		],
	},
	{
		group: 'Instep Circumference',
		fields: [
			{ name: 'instepCircumferenceMin', label: 'Instep Circumference Min (cm)' },
			{ name: 'instepCircumferenceMax', label: 'Instep Circumference Max (cm)' },
		],
	},
	{
		group: 'Thigh Circumference',
		fields: [
			{ name: 'thighCircumferenceMin', label: 'Thigh Circumference Min (cm)' },
			{ name: 'thighCircumferenceMax', label: 'Thigh Circumference Max (cm)' },
		],
	},
];
