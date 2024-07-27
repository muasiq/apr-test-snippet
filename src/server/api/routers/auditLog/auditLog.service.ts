import { PatientAuditLogAction } from '@prisma/client';
import logger from '~/common/utils/logger';
import { prisma } from '../../../prisma';
import { ProtectedTRPCContext } from '../../trpc';

type CreateAuditLogInput = {
	patientId: number;
	payload?: object;
	action: PatientAuditLogAction;
};

export const createAuditLog = async (input: CreateAuditLogInput, ctx: ProtectedTRPCContext) => {
	try {
		await ctx.db.patientAuditLog.create({
			data: {
				action: input.action,
				payload: input.payload,
				userId: ctx.session.user.id,
				patientId: input.patientId,
			},
		});
	} catch (e) {
		logger.error(`failed to create audit log for patientId: ${input.patientId}`, e);
	}
};

export async function logPromptAttempt(
	systemPrompt: string,
	humanPrompt: string,
	patientId: number,
	promptName: string,
) {
	try {
		const result = await prisma.promptAuditLog.create({
			data: {
				patientId,
				prompt: `${systemPrompt}\n${humanPrompt}`,
				promptName,
			},
		});
		return result.id;
	} catch (e) {
		logger.error('Error logging prompt attempt', e);
	}
}

export async function logPromptResult(
	response: string,
	inputTokens: number,
	outputTokens: number,
	logId?: number | null,
) {
	if (!logId) {
		logger.error('No logId provided');
		return;
	}
	try {
		await prisma.promptAuditLog.update({
			where: {
				id: logId,
			},
			data: {
				inputTokens,
				outputTokens,
				response,
			},
		});
	} catch (e) {
		logger.error('Error logging prompt result', e);
	}
}
