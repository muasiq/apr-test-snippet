import { PrismaClient } from '@prisma/client';
import { createSoftDeleteExtension } from 'prisma-extension-soft-delete';
import { fieldEncryptionExtension } from 'prisma-field-encryption';

const env = process.env;

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

const basePrisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
	});

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma;

export const prisma = basePrisma
	.$extends(
		createSoftDeleteExtension({
			models: {
				Patient: true,
				PatientArtifact: true,
				AssessmentAnswer: true,
				Location: true,
				AttachmentType: true,
			},
		}),
	)
	.$extends(fieldEncryptionExtension());

export type Prisma = typeof prisma;
