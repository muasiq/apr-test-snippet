import { createTRPCRouter, permissionProtectedProcedure } from '~/server/api/trpc';
import { UserActionPermissions } from '../../../../common/utils/permissions';
import * as organizationInputs from './organization.inputs';
import * as organizationService from './organization.service';

export const organizationRouter = createTRPCRouter({
	getLocations: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENT_PROFILE).query(({ ctx }) => {
		return organizationService.getLocations(ctx);
	}),

	getAll: permissionProtectedProcedure(UserActionPermissions.SET_ACTIVE_ORG_ID).query(({ ctx }) => {
		return organizationService.getOrganizationsList(ctx);
	}),

	createLocation: permissionProtectedProcedure(UserActionPermissions.MANAGE_LOCATIONS)
		.input(organizationInputs.createLocation)
		.mutation(({ input, ctx }) => {
			return organizationService.createLocation(input, ctx);
		}),

	getUserOrganization: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENTS).query(({ ctx }) =>
		organizationService.getUserOrganization(ctx),
	),

	updateConfigurationType: permissionProtectedProcedure(UserActionPermissions.MANAGE_LOCATIONS)
		.input(organizationInputs.updateOrgConfigurationType)
		.mutation(({ input, ctx }) => {
			return organizationService.updateConfigurationType(input, ctx);
		}),

	updateOrgEmailDomains: permissionProtectedProcedure(UserActionPermissions.MANAGE_LOCATIONS)
		.input(organizationInputs.updateEmailDomains)
		.mutation(({ input, ctx }) => {
			return organizationService.updateEmailDomains(input, ctx);
		}),

	updateLocation: permissionProtectedProcedure(UserActionPermissions.MANAGE_LOCATIONS)
		.input(organizationInputs.locationUpdate)
		.mutation(({ input, ctx }) => {
			return organizationService.updateLocation(input, ctx);
		}),

	deleteLocation: permissionProtectedProcedure(UserActionPermissions.MANAGE_LOCATIONS)
		.input(organizationInputs.deleteLocation)
		.mutation(({ input, ctx }) => {
			return organizationService.deleteLocation(input, ctx);
		}),

	getLoginProfiles: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENT_PROFILE).query(({ ctx }) => {
		return organizationService.getLoginProfiles(ctx);
	}),

	updateLoginProfile: permissionProtectedProcedure(UserActionPermissions.MANAGE_LOCATIONS)
		.input(organizationInputs.loginProfileSchema)
		.mutation(({ input, ctx }) => {
			return organizationService.updateLoginProfile(input, ctx);
		}),

	deleteLoginProfile: permissionProtectedProcedure(UserActionPermissions.MANAGE_LOCATIONS)
		.input(organizationInputs.deleteLoginProfile)
		.mutation(({ input, ctx }) => {
			return organizationService.deleteLoginProfile(input, ctx);
		}),

	getAttachmentTypes: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENT_PROFILE).query(({ ctx }) => {
		return organizationService.getAttachmentTypes(ctx);
	}),

	updateAttachmentType: permissionProtectedProcedure(UserActionPermissions.MANAGE_ATTACHMENT_TYPES)
		.input(organizationInputs.attachmentTypeUpdateSchema)
		.mutation(({ input, ctx }) => {
			return organizationService.updateAttachmentType(input, ctx);
		}),

	deleteAttachmentType: permissionProtectedProcedure(UserActionPermissions.MANAGE_ATTACHMENT_TYPES)
		.input(organizationInputs.deleteAttachmentType)
		.mutation(({ input, ctx }) => {
			return organizationService.deleteAttachmentType(input, ctx);
		}),

	getVisitNoteAttachmentType: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENT_PROFILE).query(
		({ ctx }) => {
			return organizationService.getVisitNoteAttachmentType(ctx);
		},
	),

	updateVisitNoteAttachmentType: permissionProtectedProcedure(UserActionPermissions.MANAGE_ATTACHMENT_TYPES)
		.input(organizationInputs.visitNoteAttachmentTypeUpdateSchema)
		.mutation(({ input, ctx }) => {
			return organizationService.updateVisitNoteAttachmentType(input, ctx);
		}),

	getVitalSignConfigs: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENT_PROFILE).query(({ ctx }) => {
		return organizationService.getVitalSignConfigs(ctx);
	}),

	createVitalSignConfig: permissionProtectedProcedure(UserActionPermissions.MANAGE_LOCATIONS)
		.input(organizationInputs.vitalSignConfigSchema)
		.mutation(({ input, ctx }) => {
			return organizationService.createVitalSignConfig(input, ctx);
		}),

	updateVitalSignConfig: permissionProtectedProcedure(UserActionPermissions.MANAGE_LOCATIONS)
		.input(organizationInputs.vitalSignConfigUpdateSchema)
		.mutation(({ input, ctx }) => {
			return organizationService.updateVitalSignConfig(input, ctx);
		}),

	deleteVitalSignConfig: permissionProtectedProcedure(UserActionPermissions.MANAGE_LOCATIONS)
		.input(organizationInputs.vitalSignConfigDeleteSchema)
		.mutation(({ input, ctx }) => {
			return organizationService.deleteVitalSignConfig(input, ctx);
		}),

	getAssociatedPhysicians: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENT_PROFILE)
		.input(organizationInputs.getAssociatedPhysiciansSchema)
		.query(({ ctx, input }) => organizationService.getAssociatedPhysicians(ctx, input)),

	addAssociatedPhysician: permissionProtectedProcedure(UserActionPermissions.MANAGE_REFERRAL_SOURCES)
		.input(organizationInputs.associatedPhysicianSchema)
		.mutation(({ input, ctx }) => organizationService.addAssociatedPhysician(input, ctx)),

	updateAssociatedPhysician: permissionProtectedProcedure(UserActionPermissions.MANAGE_REFERRAL_SOURCES)
		.input(organizationInputs.updateAssociatedPhysician)
		.mutation(({ input, ctx }) => {
			return organizationService.updateAssociatedPhysician(input, ctx);
		}),

	removeAssociatedPhysician: permissionProtectedProcedure(UserActionPermissions.MANAGE_REFERRAL_SOURCES)
		.input(organizationInputs.removeAssociatedPhysician)
		.mutation(({ input, ctx }) => {
			return organizationService.removeAssociatedPhysician(input, ctx);
		}),

	getAssociatedFacilities: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENT_PROFILE)
		.input(organizationInputs.getAssociatedFacilitiesSchema)
		.query(({ ctx, input }) => organizationService.getAssociatedFacilities(ctx, input)),

	addAssociatedFacility: permissionProtectedProcedure(UserActionPermissions.MANAGE_REFERRAL_SOURCES)
		.input(organizationInputs.associatedFacilitySchema)
		.mutation(({ input, ctx }) => organizationService.addAssociatedFacility(input, ctx)),

	updateAssociatedFacility: permissionProtectedProcedure(UserActionPermissions.MANAGE_REFERRAL_SOURCES)
		.input(organizationInputs.updateAssociatedFacility)
		.mutation(({ input, ctx }) => {
			return organizationService.updateAssociatedFacility(input, ctx);
		}),

	removeAssociatedFacility: permissionProtectedProcedure(UserActionPermissions.MANAGE_REFERRAL_SOURCES)
		.input(organizationInputs.removeAssociatedFacility)
		.mutation(({ input, ctx }) => {
			return organizationService.removeAssociatedFacility(input, ctx);
		}),

	getSupplies: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENT_PROFILE)
		.input(organizationInputs.getSuppliesSchema)
		.query(({ ctx, input }) => organizationService.getSupplies(ctx, input)),

	addSupply: permissionProtectedProcedure(UserActionPermissions.MANAGE_ATTACHMENT_TYPES)
		.input(organizationInputs.supplySchema)
		.mutation(({ input, ctx }) => organizationService.addSupply(input, ctx)),

	updateSupply: permissionProtectedProcedure(UserActionPermissions.MANAGE_ATTACHMENT_TYPES)
		.input(organizationInputs.updateSupplySchema)
		.mutation(({ input, ctx }) => {
			return organizationService.updateSupply(input, ctx);
		}),

	removeSupply: permissionProtectedProcedure(UserActionPermissions.MANAGE_ATTACHMENT_TYPES)
		.input(organizationInputs.removeSupply)
		.mutation(({ input, ctx }) => {
			return organizationService.removeSupply(input, ctx);
		}),

	getPhysicalAssessmentCategories: permissionProtectedProcedure(
		UserActionPermissions.MANAGE_PHYSICAL_ASSESSMENT_CATEGORIES,
	).query(({ ctx }) => organizationService.getPhysicalAssessmentCategories(ctx)),

	updatePhysicalAssessmentCategory: permissionProtectedProcedure(
		UserActionPermissions.MANAGE_PHYSICAL_ASSESSMENT_CATEGORIES,
	)
		.input(organizationInputs.physicalAssessmentCategoryUpdateSchema)
		.mutation(({ input, ctx }) => organizationService.updatePhysicalAssessmentCategory(ctx, input)),

	deletePhysicalAssessmentCategory: permissionProtectedProcedure(
		UserActionPermissions.MANAGE_PHYSICAL_ASSESSMENT_CATEGORIES,
	)
		.input(organizationInputs.physicalAssessmentCategoryDeleteSchema)
		.mutation(({ input, ctx }) => organizationService.deletePhysicalAssessmentCategory(ctx, input)),

	getSkilledNursingServiceCodes: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENT_PROFILE).query(
		({ ctx }) => organizationService.getSkilledNursingServiceCodes(ctx),
	),

	updateSkilledNursingServiceCodes: permissionProtectedProcedure(
		UserActionPermissions.MANAGE_PHYSICAL_ASSESSMENT_CATEGORIES,
	)
		.input(organizationInputs.skilledNursingServiceCodeUpdateSchema)
		.mutation(({ input, ctx }) => organizationService.updateSkilledNursingServiceCodes(ctx, input)),

	deleteSkilledNursingServiceCode: permissionProtectedProcedure(
		UserActionPermissions.MANAGE_PHYSICAL_ASSESSMENT_CATEGORIES,
	)
		.input(organizationInputs.skilledNursingServiceCodeDeleteSchema)
		.mutation(({ input, ctx }) => organizationService.deleteSkilledNursingServiceCode(ctx, input)),

	getAdditionalEvaluationServiceCodes: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENT_PROFILE).query(
		({ ctx }) => organizationService.getAdditionalEvaluationServiceCodes(ctx),
	),

	updateAdditionalEvaluationServiceCodes: permissionProtectedProcedure(
		UserActionPermissions.MANAGE_PHYSICAL_ASSESSMENT_CATEGORIES,
	)
		.input(organizationInputs.additionalEvaluationServiceCodeUpdateSchema)
		.mutation(({ input, ctx }) => organizationService.updateAdditionalEvaluationServiceCodes(ctx, input)),

	deleteAdditionalEvaluationServiceCode: permissionProtectedProcedure(
		UserActionPermissions.MANAGE_PHYSICAL_ASSESSMENT_CATEGORIES,
	)
		.input(organizationInputs.additionalEvaluationServiceCodeDeleteSchema)
		.mutation(({ input, ctx }) => organizationService.deleteAdditionalEvaluationServiceCode(ctx, input)),

	getAdditionalDropdownConfiguration: permissionProtectedProcedure(UserActionPermissions.VIEW_PATIENT_PROFILE)
		.output(organizationInputs.additionalDropdownConfigurationSchema)
		.query(({ ctx }) => organizationService.getAdditionalDropdownConfiguration(ctx)),

	updateAdditionalDropdownConfiguration: permissionProtectedProcedure(UserActionPermissions.MANAGE_ATTACHMENT_TYPES)
		.input(organizationInputs.additionalDropdownConfigurationSchema)
		.mutation(({ input, ctx }) => organizationService.updateAdditionalDropdownConfiguration(ctx, input)),
});
