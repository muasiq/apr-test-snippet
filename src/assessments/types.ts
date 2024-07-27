/* eslint-disable @typescript-eslint/naming-convention */
import { PatientArtifactTag } from '@prisma/client';
import { CustomSuggesters } from './apricot/custom';
import { DataRendererOptions } from './apricot/data-renderers/options';
import { AllThemes, ShortLabels } from './nurse-interview/questions';
import { AutoCalculateOptions } from './oasis/auto-calculate-fields/options';
import { PreReqOptions } from './oasis/prerequisites/PreReqOptions';

export enum AssessmentQuestionSources {
	Oasis = 'Oasis',
	PhysicalAssessment = 'PhysicalAssessment',
	Pathways = 'Pathways',
	SOCStandardAssessment = 'SOCStandardAssessment',
	Custom = 'Custom',
	WellSky = 'WellSky',
	ApricotCore = 'ApricotCore',
}

export interface MultipleQuestionGroup {
	repeatTimesFieldResolver: string;
	questions: QuestionSource[];
	theme: AllThemes;
}

export interface RollupForRPAApi {
	id: string;
	text: string;
}

export interface SubGroup {
	heading: string;
	questions: QuestionSource[];
	multiple?: MultipleQuestionGroup;
	rollupForRpaApi?: RollupForRPAApi;
}

export interface Group {
	heading: string;
	subGroups: SubGroup[];
	subHeadings?: Group[];
}

export interface AssessmentResponse {
	code?: string | null;
	sequence?: number;
	text: string;
	originalText?: string;
	reference?: number | string;
	followup?: string[] | null;
	interventions?: string[];
	goals?: string[];
}

export interface QuestionSource {
	id?: string;
	source?: AssessmentQuestionSources;
	note?: string;
	patientDataResolver?: DataRendererOptions;
	autoCalculateFieldResolver?: AutoCalculateOptions;
	preRequisiteSatisfied?: PreReqOptions;
	artifactContext?: PatientArtifactTag[];
	interviewContext?: ShortLabels[];
}

export interface ConfiguredResponses {
	id?: string | null;
	active?: boolean | null;
	responses: AssessmentResponse[];
}

export interface QuestionBase {
	notUsed?: boolean | null;
	id: string;
	id_item?: string;
	loincCode?: string | null;
	loincId?: string | null;
	shortName?: string | null;
	text: string;
	originalText?: string;
	alternateQuestionText?: string;
	codingInstructions?: null | string;
	template?: string | null;
	hints?: string;
	examples?: string;
	itemNotes?: string;
	skipPattern?: boolean | null;
	skipLogicHelpText?: null | string;
	sequence?: number;
	assessment?: string;
	type?: string;
	rowType?: string;
	prerequisite?: null | string;
	mayBeSkipped?: boolean;
	mayBeNotAssessed?: boolean;
	parentId?: null | string;
	questionType?: string;
	section?: string;
	responses?: AssessmentResponse[] | null;
	hchb?: ConfiguredResponses;
	wellsky?: ConfiguredResponses;
	suggestionGenerator?: CustomSuggesters;
	treatmentCode?: string;
}

export interface OasisFollowups {
	oasisId: string;
	responses: AssessmentResponse[];
}

export type AssessmentQuestion = QuestionBase & {
	mappedType: AssessmentQuestionType;
	source: AssessmentQuestionSources;
};

export enum AssessmentQuestionType {
	Panel = 'Panel',
	FreeForm = 'FreeForm',
	LongText = 'LongText',
	FreeFormNumber = 'FreeFormNumber',
	Date = 'Date',
	SelectAllThatApply = 'SelectAllThatApply',
	SelectOne = 'SelectOne',
	Unknown = 'Unknown',
	Medication = 'Medication',
	MedAdmin = 'MedAdmin',
	Vaccination = 'Vaccination',
	Diagnosis = 'Diagnosis',
	Wounds = 'Wounds',
	WoundsWellSky = 'WoundsWellSky',
	PlanBuilder = 'PlanBuilder',
	SupplyList = 'SupplyList',
	AdvanceDirectives = 'AdvanceDirectives',
	HomeHealthAideVisitFrequencies = 'HomeHealthAideVisitFrequencies',
	SkilledNursingVisitFrequencies = 'SkilledNursingVisitFrequencies',
	Procedures = 'Procedures',
	AdditionalEvaluation = 'AdditionalEvaluation',
	Facilities = 'Facilities',
	EmbeddedObject = 'EmbeddedObject',
	VitalSignParameters = 'VitalSignParameters',
}

export type AllAssessmentQuestions = AssessmentQuestion[];

export type AssessmentFacilityData = {
	Name: string;
	Type: string;
	Address?: string | null;
	City?: string | null;
	State?: string | null;
	Phone?: string | null;
	Fax?: string | null;
};
