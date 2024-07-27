import { ConfigurationType, Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { DataAccessPermissions, hasFullSystemAccess } from '../../../../common/utils/permissions';
import { PermissionedTRPCContext } from '../../trpc';
import {
	AdditionalDropdownConfigurationInput,
	AdditionalEvaluationServiceCodeDeleteInput,
	AdditionalEvaluationServiceCodeUpdateInput,
	AssociatedFacilityInput,
	AssociatedPhysicianInput,
	AttachmentTypeUpdateInput,
	DeleteAttachmentTypeInput,
	DeleteLoginProfileInput,
	GetAssociatedFacilitiesInput,
	GetAssociatedPhysiciansInput,
	GetSuppliesInput,
	LocationDeleteInput,
	LocationUpdateInput,
	LoginProfileFormData,
	PhysicalAssessmentCategoryDeleteInput,
	PhysicalAssessmentCategoryUpdateInput,
	RemoveAssociatedPhysicianInput,
	RemoveSupplyInput,
	SkilledNursingServiceCodeDeleteInput,
	SkilledNursingServiceCodeUpdateInput,
	SupplyInput,
	UpdateAssociatedFacilityInput,
	UpdateAssociatedPhysicianInput,
	UpdateSupplyInput,
	VisitNoteAttachmentTypeInput,
	VitalSignConfigDeleteInput,
	VitalSignConfigInput,
	VitalSignConfigUpdateInput,
} from './organization.inputs';

export const getById = async (ctx: PermissionedTRPCContext, organizationId: number) => {
	if (!hasFullSystemAccess(ctx.dataAccessLevel) && organizationId !== ctx.activeOrganizationId) {
		throw new Error('You do not have permission to view other orgs');
	}
	const org = await ctx.db.organization.findUniqueOrThrow({ where: { id: organizationId } });
	return org;
};

export const getLocations = async (ctx: PermissionedTRPCContext) => {
	if ([DataAccessPermissions.BRANCH, DataAccessPermissions.MINE].includes(ctx.dataAccessLevel)) {
		const { id: userId } = ctx.session.user;
		const user = await ctx.db.user.findUniqueOrThrow({ where: { id: userId }, include: { Locations: true } });
		const locationIds = user.Locations.map((location) => location.id);
		return ctx.db.location.findMany({
			where: { organizationId: ctx.activeOrganizationId, id: { in: locationIds } },
		});
	}
	return ctx.db.location.findMany({ where: { organizationId: ctx.activeOrganizationId } });
};

export const createLocation = (input: { name: string }, ctx: PermissionedTRPCContext) => {
	return ctx.db.location.create({
		data: {
			name: input.name,
			organizationId: ctx.activeOrganizationId,
		},
	});
};

export const getOrganizationsList = async (ctx: PermissionedTRPCContext) => {
	return ctx.db.organization.findMany();
};

export const getUserOrganization = async (ctx: PermissionedTRPCContext) => {
	const orgId = ctx.activeOrganizationId;
	const org = await ctx.db.organization.findUniqueOrThrow({ where: { id: orgId } });
	return org;
};

export const updateConfigurationType = async (
	input: { configurationType: ConfigurationType },
	ctx: PermissionedTRPCContext,
) => {
	return ctx.db.organization.update({
		where: { id: ctx.activeOrganizationId },
		data: {
			configurationType: input.configurationType,
		},
	});
};

export const updateEmailDomains = async (input: { emailDomains: string[] }, ctx: PermissionedTRPCContext) => {
	return ctx.db.organization.update({
		where: { id: ctx.activeOrganizationId },
		data: {
			emailDomains: input.emailDomains,
		},
	});
};

export const updateLocation = async (input: LocationUpdateInput, ctx: PermissionedTRPCContext) => {
	const result = await ctx.db.location.upsert({
		where: {
			organizationId_name: {
				organizationId: ctx.activeOrganizationId,
				name: input.name,
			},
		},
		create: {
			...input,
			organizationId: ctx.activeOrganizationId,
		},
		update: {
			...input,
		},
	});
	return result;
};

export const deleteLocation = async (input: LocationDeleteInput, ctx: PermissionedTRPCContext) => {
	return ctx.db.location.delete({ where: { id: input.id, organizationId: ctx.activeOrganizationId } });
};

export const getLoginProfiles = async (ctx: PermissionedTRPCContext) => {
	return ctx.db.loginProfile.findMany({ where: { organizationId: ctx.activeOrganizationId } });
};

export const updateLoginProfile = async (input: LoginProfileFormData, ctx: PermissionedTRPCContext) => {
	if (input.mainLogin) {
		const existingMain = await ctx.db.loginProfile.findFirst({
			where: { organizationId: ctx.activeOrganizationId, mainLogin: true },
		});
		if (existingMain && input.hchbUsername !== existingMain.hchbUsername) {
			throw new TRPCError({ message: 'You can only have one main login profile', code: 'BAD_REQUEST' });
		}
	}
	const result = await ctx.db.loginProfile.upsert({
		where: {
			organizationId_hchbUsername: {
				organizationId: ctx.activeOrganizationId,
				hchbUsername: input.hchbUsername,
			},
		},
		create: {
			...input,
			organizationId: ctx.activeOrganizationId,
		},
		update: input,
	});
	return result;
};

export async function getVisitNoteAttachmentType(ctx: PermissionedTRPCContext) {
	const org = await ctx.db.organization.findUniqueOrThrow({
		where: { id: ctx.activeOrganizationId },
		include: { VisitNoteAttachmentType: true },
	});
	return org.VisitNoteAttachmentType;
}

export async function updateVisitNoteAttachmentType(input: VisitNoteAttachmentTypeInput, ctx: PermissionedTRPCContext) {
	// upsert of soft deleted models through a toOne relation is not supported
	const attachmentType = await getVisitNoteAttachmentType(ctx);
	if (attachmentType) {
		return ctx.db.attachmentType.update({
			where: { id: attachmentType.id },
			data: input,
		});
	} else {
		return ctx.db.organization.update({
			where: { id: ctx.activeOrganizationId },
			data: {
				VisitNoteAttachmentType: {
					create: {
						...input,
						description: 'Apricot Visit Note',
						requiredForSOC: false,
					},
				},
			},
		});
	}
}

export const getAttachmentTypes = async (ctx: PermissionedTRPCContext) => {
	return await ctx.db.attachmentType.findMany({
		where: { organizationId: ctx.activeOrganizationId },
		orderBy: { createdAt: 'asc' },
	});
};

export const updateAttachmentType = async (input: AttachmentTypeUpdateInput, ctx: PermissionedTRPCContext) => {
	const { id, ...rest } = input;
	if (id) {
		return ctx.db.attachmentType.update({
			where: { id, organizationId: ctx.activeOrganizationId },
			data: rest,
		});
	}
	const result = await ctx.db.attachmentType.upsert({
		where: {
			organizationId_type_description: {
				organizationId: ctx.activeOrganizationId,
				type: input.type,
				description: input.description,
			},
		},
		create: {
			...rest,
			organizationId: ctx.activeOrganizationId,
		},
		update: {
			...rest,
		},
	});
	return result;
};

export const deleteAttachmentType = async (input: DeleteAttachmentTypeInput, ctx: PermissionedTRPCContext) => {
	return ctx.db.attachmentType.delete({ where: { id: input.id, organizationId: ctx.activeOrganizationId } });
};

export const deleteLoginProfile = async (input: DeleteLoginProfileInput, ctx: PermissionedTRPCContext) => {
	return ctx.db.loginProfile.delete({ where: { id: input.id, organizationId: ctx.activeOrganizationId } });
};

export const getVitalSignConfigs = async (ctx: PermissionedTRPCContext) => {
	return ctx.db.vitalSignConfig.findMany({
		where: { organizationId: ctx.activeOrganizationId },
		orderBy: { createdAt: 'asc' },
	});
};

export const createVitalSignConfig = async (data: VitalSignConfigInput, ctx: PermissionedTRPCContext) => {
	const result = await ctx.db.vitalSignConfig.create({ data: { ...data, organizationId: ctx.activeOrganizationId } });
	return result;
};

export const updateVitalSignConfig = async (input: VitalSignConfigUpdateInput, ctx: PermissionedTRPCContext) => {
	const { id, ...rest } = input;
	const result = await ctx.db.vitalSignConfig.update({
		where: { id, organizationId: ctx.activeOrganizationId },
		data: rest,
	});
	return result;
};

export const deleteVitalSignConfig = async (input: VitalSignConfigDeleteInput, ctx: PermissionedTRPCContext) => {
	const result = await ctx.db.vitalSignConfig.delete({
		where: { id: input.id, organizationId: ctx.activeOrganizationId },
	});
	return result;
};

export const getAssociatedPhysicians = async (ctx: PermissionedTRPCContext, input: GetAssociatedPhysiciansInput) => {
	const { page, pageSize, searchText, sortBy, sortDirection } = input;

	const query: Prisma.AssociatedPhysicianFindManyArgs = {
		where: {
			organizationId: ctx.activeOrganizationId,
			name: searchText ? { contains: searchText, mode: 'insensitive' } : undefined,
		},
		orderBy: { [sortBy]: sortDirection },
		skip: page * pageSize,
		take: pageSize,
	};

	const [list, count] = await Promise.all([
		ctx.db.associatedPhysician.findMany(query),
		ctx.db.associatedPhysician.count({ where: query.where }),
	]);

	return { list, count };
};

export const addAssociatedPhysician = async (input: AssociatedPhysicianInput, ctx: PermissionedTRPCContext) => {
	const result = await ctx.db.associatedPhysician.create({
		data: {
			...input,
			organizationId: ctx.activeOrganizationId,
		},
	});
	return result;
};

export const updateAssociatedPhysician = async (
	input: UpdateAssociatedPhysicianInput,
	ctx: PermissionedTRPCContext,
) => {
	const { id, ...rest } = input;
	const result = await ctx.db.associatedPhysician.update({
		where: { id, organizationId: ctx.activeOrganizationId },
		data: rest,
	});
	return result;
};

export const removeAssociatedPhysician = async (
	input: RemoveAssociatedPhysicianInput,
	ctx: PermissionedTRPCContext,
) => {
	const result = await ctx.db.associatedPhysician.delete({
		where: { id: input.id, organizationId: ctx.activeOrganizationId },
	});
	return result;
};

export const getAssociatedFacilities = async (ctx: PermissionedTRPCContext, input: GetAssociatedFacilitiesInput) => {
	const { page, pageSize, searchText, sortBy, sortDirection } = input;

	const query: Prisma.FacilityFindManyArgs = {
		where: {
			organizationId: ctx.activeOrganizationId,
			name: searchText ? { contains: searchText, mode: 'insensitive' } : undefined,
		},
		orderBy: { [sortBy]: sortDirection },
		skip: page * pageSize,
		take: pageSize,
	};

	const [list, count] = await Promise.all([
		ctx.db.facility.findMany(query),
		ctx.db.facility.count({ where: query.where }),
	]);

	return { list, count };
};

export const addAssociatedFacility = async (input: AssociatedFacilityInput, ctx: PermissionedTRPCContext) => {
	const result = await ctx.db.facility.create({
		data: {
			...input,
			organizationId: ctx.activeOrganizationId,
		},
	});
	return result;
};

export const updateAssociatedFacility = async (input: UpdateAssociatedFacilityInput, ctx: PermissionedTRPCContext) => {
	const { id, ...rest } = input;
	const result = await ctx.db.facility.update({
		where: { id, organizationId: ctx.activeOrganizationId },
		data: rest,
	});
	return result;
};

export const removeAssociatedFacility = async (input: RemoveAssociatedPhysicianInput, ctx: PermissionedTRPCContext) => {
	const result = await ctx.db.facility.delete({
		where: { id: input.id, organizationId: ctx.activeOrganizationId },
	});
	return result;
};

export const getSupplies = async (ctx: PermissionedTRPCContext, input: GetSuppliesInput) => {
	const { page, pageSize, searchText, sortBy, sortDirection } = input;

	const query: Prisma.SupplyFindManyArgs = {
		where: {
			organizationId: ctx.activeOrganizationId,
			package: searchText ? { contains: searchText, mode: 'insensitive' } : undefined,
		},
		orderBy: { [sortBy]: sortDirection },
		skip: page * pageSize,
		take: pageSize,
	};

	const [list, count] = await Promise.all([
		ctx.db.supply.findMany(query),
		ctx.db.supply.count({ where: query.where }),
	]);

	return { list, count };
};

export const addSupply = async (input: SupplyInput, ctx: PermissionedTRPCContext) => {
	const result = await ctx.db.supply.create({
		data: {
			...input,
			organizationId: ctx.activeOrganizationId,
		},
	});
	return result;
};

export const updateSupply = async (input: UpdateSupplyInput, ctx: PermissionedTRPCContext) => {
	const { id, ...rest } = input;
	const result = await ctx.db.supply.update({
		where: { id, organizationId: ctx.activeOrganizationId },
		data: rest,
	});
	return result;
};

export const removeSupply = async (input: RemoveSupplyInput, ctx: PermissionedTRPCContext) => {
	const result = await ctx.db.supply.delete({
		where: { id: input.id, organizationId: ctx.activeOrganizationId },
	});
	return result;
};

export const getPhysicalAssessmentCategories = async (ctx: PermissionedTRPCContext) => {
	return ctx.db.physicalAssessmentCategory.findMany({
		where: { organizationId: ctx.activeOrganizationId },
	});
};

export const updatePhysicalAssessmentCategory = async (
	ctx: PermissionedTRPCContext,
	input: PhysicalAssessmentCategoryUpdateInput,
) => {
	return ctx.db.physicalAssessmentCategory.upsert({
		where: {
			organizationId_name: {
				organizationId: ctx.activeOrganizationId,
				name: input.name,
			},
		},
		create: {
			name: input.name,
			organizationId: ctx.activeOrganizationId,
		},
		update: {
			name: input.name,
		},
	});
};

export const deletePhysicalAssessmentCategory = async (
	ctx: PermissionedTRPCContext,
	input: PhysicalAssessmentCategoryDeleteInput,
) => {
	return ctx.db.physicalAssessmentCategory.delete({
		where: { id: input.id, organizationId: ctx.activeOrganizationId },
	});
};

export const getSkilledNursingServiceCodes = async (ctx: PermissionedTRPCContext) => {
	return ctx.db.skilledNursingServiceCodes.findMany({
		where: { organizationId: ctx.activeOrganizationId },
	});
};

export const updateSkilledNursingServiceCodes = async (
	ctx: PermissionedTRPCContext,
	input: SkilledNursingServiceCodeUpdateInput,
) => {
	return ctx.db.skilledNursingServiceCodes.upsert({
		where: {
			organizationId_code: {
				organizationId: ctx.activeOrganizationId,
				code: input.code,
			},
		},
		create: {
			code: input.code,
			description: input.description,
			organizationId: ctx.activeOrganizationId,
		},
		update: {
			code: input.code,
			description: input.description,
		},
	});
};

export const deleteSkilledNursingServiceCode = async (
	ctx: PermissionedTRPCContext,
	input: SkilledNursingServiceCodeDeleteInput,
) => {
	return ctx.db.skilledNursingServiceCodes.delete({
		where: { id: input.id, organizationId: ctx.activeOrganizationId },
	});
};

export const getAdditionalEvaluationServiceCodes = async (ctx: PermissionedTRPCContext) => {
	return ctx.db.additionalEvaluationServiceCodes.findMany({
		where: { organizationId: ctx.activeOrganizationId },
	});
};

export const updateAdditionalEvaluationServiceCodes = async (
	ctx: PermissionedTRPCContext,
	input: AdditionalEvaluationServiceCodeUpdateInput,
) => {
	return ctx.db.additionalEvaluationServiceCodes.upsert({
		where: {
			organizationId_code: {
				organizationId: ctx.activeOrganizationId,
				code: input.code,
			},
		},
		create: {
			code: input.code,
			description: input.description,
			discipline: input.discipline,
			organizationId: ctx.activeOrganizationId,
		},
		update: {
			code: input.code,
			description: input.description,
			discipline: input.discipline,
		},
	});
};

export const deleteAdditionalEvaluationServiceCode = async (
	ctx: PermissionedTRPCContext,
	input: AdditionalEvaluationServiceCodeDeleteInput,
) => {
	return ctx.db.additionalEvaluationServiceCodes.delete({
		where: { id: input.id, organizationId: ctx.activeOrganizationId },
	});
};

export const getAdditionalDropdownConfiguration = async (ctx: PermissionedTRPCContext) => {
	const org = await getUserOrganization(ctx);
	return (org.additionalDropdownConfiguration ?? {
		serviceLocations: [],
		patientContactRelationship: [],
		patientContactAvailability: [],
		payorType: [],
		facilityType: [],
		advanceDirectiveType: [],
		advanceDirectiveContents: [],
		supplyDeliveryMethod: [],
		vaccinationType: [],
		vaccinationSource: [],
		medicationFrequency: [],
		medicationRoute: [],
		additionalMedicationDescriptors: [],
	}) as AdditionalDropdownConfigurationInput;
};

export const updateAdditionalDropdownConfiguration = async (
	ctx: PermissionedTRPCContext,
	input: AdditionalDropdownConfigurationInput,
) => {
	console.log({ input });
	return ctx.db.organization.update({
		where: { id: ctx.activeOrganizationId },
		data: {
			additionalDropdownConfiguration: input,
		},
	});
};
