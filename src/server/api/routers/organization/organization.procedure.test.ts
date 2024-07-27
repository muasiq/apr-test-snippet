import { faker } from '@faker-js/faker';
import { expect, it } from '@jest/globals';
import { ConfigurationType, UserRole } from '@prisma/client';
import { TestUser, createTestContext, createTestData } from '../../../../../test/util';
import { createCaller } from '../../root';
import {
	AttachmentTypeUpdateInput,
	VitalSignConfigInput,
	physicalAssessmentCategoryUpdateSchema,
} from './organization.inputs';

describe('Organization Router', () => {
	let user: TestUser;

	beforeAll(async () => {
		user = await createTestData([UserRole.OrgAdmin]);
	});

	describe('getLocations', () => {
		it("should return locations for user's org", async () => {
			const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
			const api = createCaller(ctx);

			const orgs = await api.organization.getLocations();
			expect(orgs).toBeInstanceOf(Array);
			expect(orgs.every((org) => org.organizationId === user.organizationId)).toBe(true);
		});
	});

	describe('createLocation', () => {
		it('should create a location', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
			const api = createCaller(ctx);

			const locationName = faker.company.name();

			const location = await api.organization.createLocation({ name: locationName });
			expect(location.name).toBe(locationName);
		});
	});

	describe('getUserOrganization', () => {
		it('should return user organization', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
			const api = createCaller(ctx);

			const org = await api.organization.getUserOrganization();
			expect(org.id).toBe(user.organizationId);
			expect(org.configurationType).toBe(ConfigurationType.HomeCareHomeBase);
		});
	});

	describe('updateConfigurationType', () => {
		it('should update configuration type', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
			const api = createCaller(ctx);

			const configurationType = faker.helpers.arrayElement(Object.values(ConfigurationType));

			const org = await api.organization.updateConfigurationType({ configurationType });
			expect(org.configurationType).toBe(configurationType);
		});
	});

	describe('updateOrgEmailDomains', () => {
		it('should update email domains', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
			const api = createCaller(ctx);

			const emailDomains = [faker.internet.domainName()];

			const org = await api.organization.updateOrgEmailDomains({ emailDomains });
			expect(org.emailDomains).toEqual(emailDomains);
		});
	});

	describe('getLocations', () => {
		it("should return locations for user's org", async () => {
			const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
			const api = createCaller(ctx);

			const orgs = await api.organization.getLocations();
			expect(orgs).toBeInstanceOf(Array);
			expect(orgs.every((org) => org.organizationId === user.organizationId)).toBe(true);
		});
	});

	describe('updateLocation', () => {
		it('should update location', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
			const api = createCaller(ctx);

			const locationName = faker.company.name();

			await api.organization.createLocation({ name: locationName });

			const updatedLocationName = faker.company.name();

			const updatedLocation = await api.organization.updateLocation({
				name: updatedLocationName,
			});
			expect(updatedLocation.name).toBe(updatedLocationName);
		});
	});

	describe('deleteLocation', () => {
		it('should delete location', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
			const api = createCaller(ctx);

			const locationName = faker.company.name();
			const location = await api.organization.createLocation({ name: locationName });

			const orgsWithLocation = await api.organization.getLocations();
			expect(orgsWithLocation).toContainEqual(location);

			await api.organization.deleteLocation(location);

			const orgsWithoutLocation = await api.organization.getLocations();
			expect(orgsWithoutLocation).not.toContainEqual(location);
		});
	});

	describe('getLoginProfiles', () => {
		it("should return login profiles for user's org", async () => {
			const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });
			const api = createCaller(ctx);

			const loginProfiles = await api.organization.getLoginProfiles();
			expect(loginProfiles).toBeInstanceOf(Array);
			expect(loginProfiles.every((profile) => profile.organizationId === user.organizationId)).toBe(true);
		});
	});

	describe('updateLoginProfile', () => {
		it('should update login profile', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
			const api = createCaller(ctx);

			const firstName = faker.person.firstName();
			const lastName = faker.person.lastName();
			const hchbUsername = faker.internet.userName();
			const hchbPassword = faker.internet.password();
			const pointcareUserId = faker.number.int().toString();
			const pointcarePassword = faker.internet.password();

			const loginProfile = await api.organization.updateLoginProfile({
				firstName,
				lastName,
				hchbUsername,
				hchbPassword,
				pointcareUserId,
				pointcarePassword,
			});
			expect(loginProfile.firstName).toBe(firstName);
			expect(loginProfile.lastName).toBe(lastName);
			expect(loginProfile.hchbUsername).toBe(hchbUsername);
			expect(loginProfile.hchbPassword).toBe(hchbPassword);
			expect(loginProfile.pointcareUserId).toBe(pointcareUserId);
			expect(loginProfile.pointcarePassword).toBe(pointcarePassword);
		});
	});

	describe('deleteLoginProfile', () => {
		it('should delete login profile', async () => {
			const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
			const api = createCaller(ctx);

			const firstName = faker.person.firstName();
			const lastName = faker.person.lastName();
			const hchbUsername = faker.internet.userName();
			const hchbPassword = faker.internet.password();
			const pointcareUserId = faker.number.int().toString();
			const pointcarePassword = faker.internet.password();

			const loginProfile = await api.organization.updateLoginProfile({
				firstName,
				lastName,
				hchbUsername,
				hchbPassword,
				pointcareUserId,
				pointcarePassword,
			});

			const loginProfiles = await api.organization.getLoginProfiles();
			expect(loginProfiles).toContainEqual(loginProfile);

			await api.organization.deleteLoginProfile(loginProfile);

			const updatedLoginProfiles = await api.organization.getLoginProfiles();
			expect(updatedLoginProfiles).not.toContainEqual(loginProfile);
		});
	});

	describe('VitalSignConfigs', () => {
		const addTestVitalSignConfig = async (api: ReturnType<typeof createCaller>) => {
			const vitalSignConfigData: VitalSignConfigInput = {
				name: faker.lorem.word(),
				temperatureMin: faker.number.int({ max: 96, min: 90 }),
				temperatureMax: faker.number.int({ max: 102, min: 97 }),
			};

			return await api.organization.createVitalSignConfig(vitalSignConfigData);
		};

		beforeAll(async () => {
			const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
			const api = createCaller(ctx);
			await addTestVitalSignConfig(api);
		});

		describe('getVitalSignConfigs', () => {
			it("should return vital sign configs for user's org", async () => {
				const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
				const api = createCaller(ctx);

				const vitalSignConfigs = await api.organization.getVitalSignConfigs();
				expect(vitalSignConfigs).toBeInstanceOf(Array);
			});
		});

		describe('updateVitalSignConfig', () => {
			it('should update vital sign config', async () => {
				const ctx = createTestContext({ user, roles: [UserRole.SuperAdmin] });
				const api = createCaller(ctx);

				const config = await addTestVitalSignConfig(api);

				const configUpdates = {
					...config,
					temperatureMin: faker.number.int({ max: 96, min: 90 }),
					bloodPressureSystolicMin: faker.number.int({ max: 100, min: 90 }),
				};

				const updatedConfig = await api.organization.updateVitalSignConfig(configUpdates);
				expect(updatedConfig.temperatureMin).toBe(configUpdates.temperatureMin);
				expect(updatedConfig.bloodPressureSystolicMin).toBe(configUpdates.bloodPressureSystolicMin);
			});
		});

		describe('deleteVitalSignConfig', () => {
			it('should delete vital sign config', async () => {
				const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
				const api = createCaller(ctx);

				const configToDelete = await addTestVitalSignConfig(api);

				const vitalSignConfigs = await api.organization.getVitalSignConfigs();
				expect(vitalSignConfigs.map((config) => config.id)).toContain(configToDelete.id);

				await api.organization.deleteVitalSignConfig(configToDelete);

				const updatedVitalSignConfigs = await api.organization.getVitalSignConfigs();
				expect(updatedVitalSignConfigs.map((config) => config.id)).not.toContain(configToDelete.id);
			});
		});
	});
	describe('Attachment Type', () => {
		describe('getAttachmentTypes', () => {
			it("should return attachment types for user's org", async () => {
				const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
				const api = createCaller(ctx);

				const attachmentTypes = await api.organization.getAttachmentTypes();
				expect(attachmentTypes).toBeInstanceOf(Array);
			});
		}),
			describe('updateAttachmentType', () => {
				it('should update attachment type', async () => {
					const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
					const api = createCaller(ctx);

					const attachmentType = faker.lorem.word();
					const location = faker.lorem.word();

					await api.organization.updateAttachmentType({
						description: faker.lorem.sentence(),
						type: attachmentType,
						location,
						notes: faker.lorem.sentence(),
					});

					const updatedAttachmentData = {
						description: faker.lorem.sentence(),
						type: attachmentType,
						location,
						notes: faker.lorem.sentence(),
					} as AttachmentTypeUpdateInput;

					const updatedAttachmentType = await api.organization.updateAttachmentType(updatedAttachmentData);
					expect(updatedAttachmentType?.description).toBe(updatedAttachmentData.description);
					expect(updatedAttachmentType?.type).toBe(updatedAttachmentData.type);
					expect(updatedAttachmentType?.location).toBe(updatedAttachmentData.location);
					expect(updatedAttachmentType?.notes).toBe(updatedAttachmentData.notes);
				});
			});
	});

	describe('Organization Associated Physicians', () => {
		const query = {
			page: 0,
			pageSize: 10,
			searchText: '',
		};

		describe('getAssociatedPhysicians', () => {
			it("should return associated physicians for user's org", async () => {
				const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
				const api = createCaller(ctx);
				const physicianQuery = await api.organization.getAssociatedPhysicians(query);
				expect(physicianQuery.list).toBeInstanceOf(Array);
				expect(physicianQuery.count).toBeGreaterThanOrEqual(0);
			});
		}),
			describe('createAssociatedPhysician', () => {
				it('should create an associated physician', async () => {
					const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
					const api = createCaller(ctx);

					const name = faker.person.fullName();
					const newPhysician = await api.organization.addAssociatedPhysician({ name });
					expect(newPhysician.name).toBe(name);
				});
			});
		describe('updateAssociatedPhysician', () => {
			it('should update associated physician', async () => {
				const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
				const api = createCaller(ctx);

				const name = faker.person.fullName();
				const newPhysician = await api.organization.addAssociatedPhysician({ name });

				const newName = faker.person.fullName();
				const updatedAssociatedPhysician = await api.organization.updateAssociatedPhysician({
					id: newPhysician.id,
					name: newName,
				});
				expect(updatedAssociatedPhysician.name).toBe(newName);
			});
		});
		describe('deleteAssociatedPhysician', () => {
			it('should delete associated physician', async () => {
				const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
				const api = createCaller(ctx);

				const name = faker.person.fullName();
				const newPhysician = await api.organization.addAssociatedPhysician({ name });

				const physicians = await api.organization.getAssociatedPhysicians(query);
				expect(physicians.list.map((type) => type.id)).toContain(newPhysician.id);

				await api.organization.removeAssociatedPhysician(newPhysician);

				const updatedPhysicians = await api.organization.getAssociatedPhysicians(query);
				expect(updatedPhysicians.list.map((type) => type.id)).not.toContain(newPhysician.id);
			});
		});
	});

	describe('Physical Assessment Categories', () => {
		describe('getPhysicalAssessmentCategories', () => {
			it("should return attachment types for user's org", async () => {
				const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
				const api = createCaller(ctx);

				const categories = await api.organization.getPhysicalAssessmentCategories();
				expect(categories).toBeInstanceOf(Array);
				expect(categories.every((type) => physicalAssessmentCategoryUpdateSchema.safeParse(type).success)).toBe(
					true,
				);
			});
		}),
			describe('createPhysicalAssessmentCategory', () => {
				it('should create a physical assessment category', async () => {
					const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
					const api = createCaller(ctx);

					const name = faker.lorem.word();
					const createdPhysicalAssessmentCategory = await api.organization.updatePhysicalAssessmentCategory({
						name,
					});
					expect(createdPhysicalAssessmentCategory.name).toBe(name);
				});
			});
		describe('updatePhysicalAssessmentCategory', () => {
			it('should update physical assessment category', async () => {
				const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
				const api = createCaller(ctx);

				const word1 = faker.lorem.word();
				const newCategory = await api.organization.updatePhysicalAssessmentCategory({ name: word1 });

				const updatedWord = faker.lorem.word();
				const updatedCategory = await api.organization.updatePhysicalAssessmentCategory({
					name: updatedWord,
				});
				expect(updatedCategory.name).toBe(updatedWord);
			});
		});
		describe('deletePhysicalAssessmentCategory', () => {
			it('should delete physical assessment category', async () => {
				const ctx = createTestContext({ user, roles: [UserRole.OrgAdmin] });
				const api = createCaller(ctx);

				const word1 = faker.lorem.word();
				const newCategory = await api.organization.updatePhysicalAssessmentCategory({ name: word1 });

				const categoriesList = await api.organization.getPhysicalAssessmentCategories();
				expect(categoriesList.map((type) => type.id)).toContain(newCategory.id);

				await api.organization.deletePhysicalAssessmentCategory(newCategory);
				const updatedList = await api.organization.getPhysicalAssessmentCategories();
				expect(updatedList.map((type) => type.id)).not.toContain(newCategory.id);
			});
		});
	});
});
