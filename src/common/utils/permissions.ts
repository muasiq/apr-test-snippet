import { PatientStatus, UserRole } from '@prisma/client';
import { orderBy, uniq } from 'lodash';
import { match, P } from 'ts-pattern';

export enum DataAccessPermissions {
	MINE_WITH_QA = 'MINE_WITH_QA',
	MINE_WITH_DATAENTRY = 'MINE_WITH_DATAENTRY',
	MINE = 'MINE',
	BRANCH = 'BRANCH',
	ORG_WITH_QA = 'ORG_WITH_QA',
	ORG_WITH_DATAENTRY = 'ORG_WITH_DATAENTRY',
	ORG = 'ORG',
	FULL_SYSTEM_WITH_QA = 'FULL_SYSTEM_WITH_QA',
	FULL_SYSTEM_WITH_DATAENTRY = 'FULL_SYSTEM_WITH_DATAENTRY',
	FULL_SYSTEM = 'FULL_SYSTEM',
}

const DataAccessLevels = {
	[DataAccessPermissions.MINE_WITH_QA]: 0,
	[DataAccessPermissions.MINE_WITH_DATAENTRY]: 1,
	[DataAccessPermissions.MINE]: 2,
	[DataAccessPermissions.BRANCH]: 3,
	[DataAccessPermissions.ORG_WITH_QA]: 4,
	[DataAccessPermissions.ORG_WITH_DATAENTRY]: 5,
	[DataAccessPermissions.ORG]: 6,
	[DataAccessPermissions.FULL_SYSTEM_WITH_QA]: 7,
	[DataAccessPermissions.FULL_SYSTEM_WITH_DATAENTRY]: 8,
	[DataAccessPermissions.FULL_SYSTEM]: 9,
};

export enum UserActionPermissions {
	SEE_ORG_SWITCHER = 'SEE_ORG_SWITCHER',
	SET_ACTIVE_ORG_ID = 'SET_ACTIVE_ORG_ID',
	VIEW_OWN_PROFILE = 'VIEW_OWN_PROFILE',
	CREATE_PATIENT = 'CREATE_PATIENT',
	CREATE_PATIENT_ARTIFACTS = 'CREATE_PATIENT_ARTIFACTS',
	VIEW_PATIENTS = 'VIEW_PATIENTS',
	RESET_PATIENT = 'RESET_PATIENT',
	QA_TAB_VISIBLE = 'QA_TAB_VISIBLE',
	GENERATE_SUGGESTION = 'GENERATE_SUGGESTION',
	VIEW_PATIENT_PROFILE = 'VIEW_PATIENT_PROFILE',
	START_RESUME_SOC_ASSESSMENT_BUTTON_VISIBLE = 'START_RESUME_SOC_ASSESSMENT_BUTTON_VISIBLE',
	ANSWER_ASSESSMENT_QUESTION = 'ANSWER_ASSESSMENT_QUESTION',
	VERIFY_MEDICATION_INTERACTIONS = 'VERIFY_MEDICATION_INTERACTIONS',
	SIGN_OFF_BUTTON_VISIBLE = 'SIGN_OFF_BUTTON_VISIBLE',
	ABLE_TO_EDIT_PATIENT_INFO_TAB = 'ABLE_TO_EDIT_PATIENT_INFO_TAB',
	ARCHIVE_PATIENT_RECORD = 'ARCHIVE_PATIENT_RECORD',
	UPDATE_PATIENT_STATUS = 'UPDATE_PATIENT_STATUS',
	MANUALLY_CHANGE_STATUS_OF_PATIENT_RECORD = 'MANUALLY_CHANGE_STATUS_OF_PATIENT_RECORD',
	MANUALLY_SET_PATIENT_RECORD_AS_COMPLETE = 'MANUALLY_SET_PATIENT_RECORD_AS_COMPLETE',
	MANUALLY_SET_PATIENT_RECORD_AS_NON_ADMIT = 'MANUALLY_SET_PATIENT_RECORD_AS_NON_ADMIT',
	MANUALLY_SET_PATIENT_RECORD_AS_NEW_PATIENT = 'MANUALLY_SET_PATIENT_RECORD_AS_NEW_PATIENT',
	DELETE_ARTIFACTS = 'DELETE_ARTIFACTS',
	ADD_REMOVE_USERS = 'ADD_REMOVE_USERS',
	LIST_CASE_MANAGERS = 'LIST_CASE_MANAGERS',
	LIST_QA_USERS = 'LIST_QA_USERS',
	LIST_DATAENTRY_USERS = 'LIST_DATAENTRY_USERS',
	MANAGE_LOCATIONS = 'MANAGE_LOCATIONS',
	SET_PERMISSIONS_FOR_USERS = 'SET_PERMISSIONS_FOR_USERS',
	APPEARS_IN_CASE_MANAGER_LIST = 'APPEARS_IN_CASE_MANAGER_LIST',
	VIEW_SELECTED_EMR = 'VIEW_SELECTED_EMR',
	VIEW_STATS_PAGE = 'VIEW_STATS_PAGE',
	AUTOFILL_ALL_DOCUMENTATION_ITEMS = 'AUTOFILL_ALL_DOCUMENTATION_ITEMS',
	VIEW_PROMPT_ITERATION_SCREEN = 'VIEW_PROMPT_ITERATION_SCREEN',
	SEE_ENV_INDICATOR = 'SEE_ENV_INDICATOR',
	MANAGE_QA = 'MANAGE_QA',
	MANAGE_DATAENTRY = 'MANAGE_DATAENTRY',
	MANAGE_ATTACHMENT_TYPES = 'MANAGE_ATTACHMENT_TYPES',
	MANAGE_REFERRAL_SOURCES = 'MANAGE_REFERRAL_SOURCES',
	MANAGE_PHYSICAL_ASSESSMENT_CATEGORIES = 'MANAGE_PHYSICAL_ASSESSMENT_CATEGORIES',
	SEARCH_MEDICATIONS = 'SEARCH_MEDICATIONS',
	GET_DISPENSABLE_DRUG = 'GET_DISPENSABLE_DRUG',
	DOWNLOAD_VISIT_NOTE = 'DOWNLOAD_VISIT_NOTE',
	VIEW_DATA_ENTRY = 'VIEW_DATA_ENTRY',
	GENERATE_TEST_DATA = 'GENERATE_TEST_DATA',
}

const basePermissions = [
	UserActionPermissions.VIEW_OWN_PROFILE,
	UserActionPermissions.VIEW_PATIENTS,
	UserActionPermissions.VIEW_PATIENT_PROFILE,
	UserActionPermissions.LIST_CASE_MANAGERS,
	UserActionPermissions.SEARCH_MEDICATIONS,
	UserActionPermissions.GET_DISPENSABLE_DRUG,
	UserActionPermissions.DOWNLOAD_VISIT_NOTE,
];

const fullSystemAccessPermissions = [
	DataAccessPermissions.FULL_SYSTEM,
	DataAccessPermissions.FULL_SYSTEM_WITH_QA,
	DataAccessPermissions.FULL_SYSTEM_WITH_DATAENTRY,
] as DataAccessPermissions[];

export const RoleToPermissionsMap: { [K in UserRole]?: { [K in DataAccessPermissions]?: UserActionPermissions[] } } = {
	[UserRole.Nurse]: {
		[DataAccessPermissions.MINE]: [
			...basePermissions,
			UserActionPermissions.CREATE_PATIENT_ARTIFACTS,
			UserActionPermissions.START_RESUME_SOC_ASSESSMENT_BUTTON_VISIBLE,
			UserActionPermissions.SIGN_OFF_BUTTON_VISIBLE,
			UserActionPermissions.ABLE_TO_EDIT_PATIENT_INFO_TAB,
			UserActionPermissions.DELETE_ARTIFACTS,
			UserActionPermissions.ANSWER_ASSESSMENT_QUESTION,
			UserActionPermissions.VERIFY_MEDICATION_INTERACTIONS,
			UserActionPermissions.GENERATE_SUGGESTION,
			UserActionPermissions.UPDATE_PATIENT_STATUS,
			UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_NON_ADMIT,
			UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_NEW_PATIENT,
		],
		[DataAccessPermissions.ORG]: [UserActionPermissions.APPEARS_IN_CASE_MANAGER_LIST],
	},
	[UserRole.BranchOffice]: {
		[DataAccessPermissions.BRANCH]: [
			...basePermissions,
			UserActionPermissions.CREATE_PATIENT,
			UserActionPermissions.CREATE_PATIENT_ARTIFACTS,
			UserActionPermissions.DELETE_ARTIFACTS,
			UserActionPermissions.ABLE_TO_EDIT_PATIENT_INFO_TAB,
			UserActionPermissions.VIEW_STATS_PAGE,
			UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_NON_ADMIT,
			UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_NEW_PATIENT,
		],
	},
	[UserRole.BranchAdmin]: {
		[DataAccessPermissions.BRANCH]: [
			...basePermissions,
			UserActionPermissions.CREATE_PATIENT,
			UserActionPermissions.CREATE_PATIENT_ARTIFACTS,
			UserActionPermissions.DELETE_ARTIFACTS,
			UserActionPermissions.ABLE_TO_EDIT_PATIENT_INFO_TAB,
			UserActionPermissions.ARCHIVE_PATIENT_RECORD,
			UserActionPermissions.VIEW_STATS_PAGE,
			UserActionPermissions.ADD_REMOVE_USERS,
			UserActionPermissions.SET_PERMISSIONS_FOR_USERS,
			UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_NON_ADMIT,
			UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_NEW_PATIENT,
		],
	},
	[UserRole.OrgOffice]: {
		[DataAccessPermissions.ORG]: [
			...basePermissions,
			UserActionPermissions.CREATE_PATIENT,
			UserActionPermissions.CREATE_PATIENT_ARTIFACTS,
			UserActionPermissions.DELETE_ARTIFACTS,
			UserActionPermissions.ABLE_TO_EDIT_PATIENT_INFO_TAB,
			UserActionPermissions.VIEW_STATS_PAGE,
			UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_NON_ADMIT,
			UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_NEW_PATIENT,
		],
	},
	[UserRole.OrgAdmin]: {
		[DataAccessPermissions.ORG]: [
			...basePermissions,
			UserActionPermissions.CREATE_PATIENT,
			UserActionPermissions.CREATE_PATIENT_ARTIFACTS,
			UserActionPermissions.DELETE_ARTIFACTS,
			UserActionPermissions.ABLE_TO_EDIT_PATIENT_INFO_TAB,
			UserActionPermissions.ARCHIVE_PATIENT_RECORD,
			UserActionPermissions.VIEW_STATS_PAGE,
			UserActionPermissions.ADD_REMOVE_USERS,
			UserActionPermissions.SET_PERMISSIONS_FOR_USERS,
			UserActionPermissions.VIEW_SELECTED_EMR,
			UserActionPermissions.MANAGE_LOCATIONS,
			UserActionPermissions.MANAGE_REFERRAL_SOURCES,
			UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_NON_ADMIT,
			UserActionPermissions.MANAGE_ATTACHMENT_TYPES,
			UserActionPermissions.MANAGE_PHYSICAL_ASSESSMENT_CATEGORIES,
			UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_NEW_PATIENT,
		],
	},
	[UserRole.QA]: {
		[DataAccessPermissions.MINE_WITH_QA]: [
			...basePermissions,
			UserActionPermissions.SET_ACTIVE_ORG_ID,
			UserActionPermissions.QA_TAB_VISIBLE,
			UserActionPermissions.ANSWER_ASSESSMENT_QUESTION,
			UserActionPermissions.GENERATE_SUGGESTION,
			UserActionPermissions.UPDATE_PATIENT_STATUS,
			UserActionPermissions.CREATE_PATIENT_ARTIFACTS,
			UserActionPermissions.ABLE_TO_EDIT_PATIENT_INFO_TAB,
			UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_COMPLETE,
			UserActionPermissions.VIEW_DATA_ENTRY,
			...(process.env.NEXT_PUBLIC_APRICOT_ENV === 'test'
				? [UserActionPermissions.AUTOFILL_ALL_DOCUMENTATION_ITEMS]
				: []),
		],
	},
	[UserRole.OrgQA]: {
		[DataAccessPermissions.ORG_WITH_QA]: [
			...basePermissions,
			UserActionPermissions.QA_TAB_VISIBLE,
			UserActionPermissions.ANSWER_ASSESSMENT_QUESTION,
			UserActionPermissions.GENERATE_SUGGESTION,
			UserActionPermissions.UPDATE_PATIENT_STATUS,
			UserActionPermissions.CREATE_PATIENT_ARTIFACTS,
			UserActionPermissions.ABLE_TO_EDIT_PATIENT_INFO_TAB,
			UserActionPermissions.VIEW_DATA_ENTRY,
			...(process.env.NEXT_PUBLIC_APRICOT_ENV === 'test'
				? [UserActionPermissions.AUTOFILL_ALL_DOCUMENTATION_ITEMS]
				: []),
		],
	},
	[UserRole.PromptIterator]: {
		[DataAccessPermissions.FULL_SYSTEM]: [
			...basePermissions,
			UserActionPermissions.SET_ACTIVE_ORG_ID,
			UserActionPermissions.SEE_ORG_SWITCHER,
			UserActionPermissions.VIEW_PROMPT_ITERATION_SCREEN,
		],
	},

	[UserRole.SuperAdmin]: {
		[DataAccessPermissions.FULL_SYSTEM]: Object.values(UserActionPermissions).filter((p) => {
			if (p === UserActionPermissions.AUTOFILL_ALL_DOCUMENTATION_ITEMS) {
				return process.env.NEXT_PUBLIC_APRICOT_ENV !== 'production';
			}
			if (p === UserActionPermissions.GENERATE_TEST_DATA) {
				return process.env.NEXT_PUBLIC_APRICOT_ENV !== 'production';
			}
			return true;
		}),
	},
	[UserRole.QaManager]: {
		[DataAccessPermissions.FULL_SYSTEM_WITH_QA]: [
			...basePermissions,
			UserActionPermissions.SET_ACTIVE_ORG_ID,
			UserActionPermissions.MANAGE_QA,
			UserActionPermissions.QA_TAB_VISIBLE,
			UserActionPermissions.ANSWER_ASSESSMENT_QUESTION,
			UserActionPermissions.GENERATE_SUGGESTION,
			UserActionPermissions.ABLE_TO_EDIT_PATIENT_INFO_TAB,
			UserActionPermissions.UPDATE_PATIENT_STATUS,
			UserActionPermissions.CREATE_PATIENT_ARTIFACTS,
			UserActionPermissions.LIST_QA_USERS,
			UserActionPermissions.MANAGE_DATAENTRY,
			UserActionPermissions.LIST_DATAENTRY_USERS,
			UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_COMPLETE,
			...(process.env.NEXT_PUBLIC_APRICOT_ENV === 'test'
				? [UserActionPermissions.AUTOFILL_ALL_DOCUMENTATION_ITEMS]
				: []),
		],
	},
	[UserRole.DataEntry]: {
		[DataAccessPermissions.MINE_WITH_DATAENTRY]: [
			...basePermissions,
			UserActionPermissions.SET_ACTIVE_ORG_ID,
			UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_COMPLETE,
			UserActionPermissions.CREATE_PATIENT_ARTIFACTS,
			UserActionPermissions.VIEW_DATA_ENTRY,
		],
	},
	[UserRole.DataEntryManager]: {
		[DataAccessPermissions.FULL_SYSTEM_WITH_DATAENTRY]: [
			...basePermissions,
			UserActionPermissions.SET_ACTIVE_ORG_ID,
			UserActionPermissions.MANAGE_DATAENTRY,
			UserActionPermissions.LIST_DATAENTRY_USERS,
			UserActionPermissions.MANUALLY_SET_PATIENT_RECORD_AS_COMPLETE,
			UserActionPermissions.CREATE_PATIENT_ARTIFACTS,
			UserActionPermissions.VIEW_DATA_ENTRY,
		],
	},
};

export const hasPermission = (
	data: DataAccessPermissions,
	action: UserActionPermissions,
	roles?: UserRole[] | null,
) => {
	if (!roles?.length) return false;
	return roles.some((role) => {
		const rolePermissions = RoleToPermissionsMap[role];
		const availableActions = rolePermissions?.[data];
		return availableActions?.includes(action);
	});
};

export const hasActionPermission = (action: UserActionPermissions, roles?: UserRole[]) => {
	if (!roles?.length) return false;
	return roles.some((role) => {
		const rolePermissions = RoleToPermissionsMap[role];
		const allAvailableActions = Object.values(DataAccessPermissions).flatMap((da) => rolePermissions?.[da]);
		return allAvailableActions?.includes(action);
	});
};

export const getDataAccessLevelForPermission = (
	userAccessPermission: UserActionPermissions,
	userRoles?: UserRole[] | null,
) => {
	if (!userRoles?.length) return null;
	const accessLevels = userRoles.flatMap((role) => {
		return Object.values(DataAccessPermissions)
			.map((dataAccessLevel) => {
				return {
					dataAccessLevel,
					hasAccessAtThisLevel: roleHasPermission(dataAccessLevel, userAccessPermission, role),
				};
			})
			.filter(({ hasAccessAtThisLevel }) => hasAccessAtThisLevel);
	});
	const ordered = orderBy(accessLevels, (level) => DataAccessLevels[level.dataAccessLevel], 'desc');
	return ordered[0]?.dataAccessLevel ?? null;
};

const roleHasPermission = (dataAccessLevel: DataAccessPermissions, action: UserActionPermissions, role: UserRole) => {
	const rolePermissions = RoleToPermissionsMap[role];
	const availableActions = rolePermissions?.[dataAccessLevel];
	return availableActions?.includes(action);
};

const AllowedRolesToManageMap = {
	[UserRole.SuperAdmin]: Object.values(UserRole),
	[UserRole.OrgAdmin]: [
		UserRole.Nurse,
		UserRole.BranchOffice,
		UserRole.BranchAdmin,
		UserRole.OrgOffice,
		UserRole.OrgAdmin,
	],
	[UserRole.BranchAdmin]: [UserRole.Nurse, UserRole.BranchOffice, UserRole.BranchAdmin],
} as Record<UserRole, UserRole[]>;

export function allowedRolesToEdit(roles?: UserRole[]) {
	if (!roles?.length) return [];
	return uniq(roles.flatMap((r) => AllowedRolesToManageMap[r] ?? []) ?? []);
}

export function hasFullSystemAccess(accessLevel: DataAccessPermissions) {
	return fullSystemAccessPermissions.includes(accessLevel);
}

export function dataAccessLevelToStatuses(dataAccessLevel: DataAccessPermissions) {
	return match(dataAccessLevel)
		.with(
			P.union(
				DataAccessPermissions.MINE_WITH_QA,
				DataAccessPermissions.ORG_WITH_DATAENTRY,
				DataAccessPermissions.FULL_SYSTEM_WITH_QA,
			),
			() => [
				PatientStatus.WithQA,
				PatientStatus.SignoffNeeded,
				PatientStatus.ReadyForEMR,
				PatientStatus.AddingToEMR,
			],
		)
		.with(
			P.union(DataAccessPermissions.MINE_WITH_DATAENTRY, DataAccessPermissions.FULL_SYSTEM_WITH_DATAENTRY),
			() => [PatientStatus.ReadyForEMR, PatientStatus.AddingToEMR],
		)
		.otherwise(() => []);
}
