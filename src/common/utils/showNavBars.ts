export enum OrgProfileTabs {
	LOGIN_SETTINGS = 'LoginSettings',
	BRANCHES = 'Branches',
	EMR_CONFIG = 'EMRConfiguration',
	REFERRAL_SOURCES = 'ReferralSources',
}

export enum Pages {
	FIELD_SCHEDULE = '/field/schedule',
	FIELD_PATIENT_LIST = '/field/patient/list',
	OFFICE_PATIENT_LIST = '/office/patient/list',
	OFFICE_PATIENT_DETAILS = '/office/patient',
	ADMIN_MANAGE_USERS = '/office/admin/manage-users',
	ADMIN_MANAGE_ORG = `/office/admin/manage-org?currentTab=${OrgProfileTabs.LOGIN_SETTINGS}`,
	PATIENT_STATS = '/office/stats/patients',
	PROMPT_ITERATION = '/office/iterate',
	PROFILE = '/profile',
	SIGN_IN = '/auth/signin',
}

export enum PageWithNavBar {
	SCHEDULE = Pages.FIELD_SCHEDULE,
	PATIENT_LIST = Pages.FIELD_PATIENT_LIST,
}

export const fieldAppOpen = (currentPathname: string) => {
	return currentPathname.startsWith('/field');
};

export const onHomePage = (currentPathname: string) => {
	return [Pages.FIELD_SCHEDULE, Pages.OFFICE_PATIENT_LIST].includes(currentPathname as Pages);
};

export const onPage = (currentPathname: string, page: Pages) => {
	return (currentPathname as Pages) === page;
};

export const renderNavBars = (currentPathname: string) => {
	if (!fieldAppOpen(currentPathname)) {
		return true;
	}
	const navValues = Object.values(PageWithNavBar) as string[];
	return navValues.includes(currentPathname);
};
