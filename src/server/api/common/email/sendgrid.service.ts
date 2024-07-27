import { Patient } from '@prisma/client';
import sendgrid, { type MailDataRequired } from '@sendgrid/mail';
import logger from '~/common/utils/logger';
import { env } from '~/env.mjs';
import { VerificationMethod } from '../../routers/user/user.inputs';

const APRICOT_ACCOUNT_EMAIL_DETAILS = { email: 'account@apricothealth.ai', name: 'Apricot' };
const shouldMockSendgrid = env.GOOGLE_CLOUD_PROJECT_ID === 'localhost';

enum EmailTemplateId {
	DEFAULT = 'd-5c3cb4458b4b43da8d807ae9708a9f25',
	OTP = 'd-c0d2ad15813444609dbbd0bb74b0666c',
}

export async function sendEmail(
	data: MailDataRequired | MailDataRequired[],
	isMultiple?: boolean,
): Promise<sendgrid.ClientResponse> {
	if (shouldMockSendgrid) {
		logger.info('Email mocked:', data);
		return {
			statusCode: 202,
			headers: {},
			body: {
				message: 'success',
			},
		};
	}

	sendgrid.setApiKey(env.SENDGRID_API_KEY);
	try {
		const [response] = await sendgrid.send({
			...data,
			isMultiple,
		});
		return response;
	} catch (error) {
		logger.error('Error sending email:', JSON.stringify(error));
		throw error;
	}
}

export async function sendAccountVerificationEmail(email: string, token: string) {
	const signInUrl = `${env.NEXTAUTH_URL}/auth/signup?email=${encodeURIComponent(email)}&token=${encodeURIComponent(
		token,
	)}&verificationMethod=${VerificationMethod.VERIFY_EMAIL}`;

	await sendEmail({
		to: email,
		from: APRICOT_ACCOUNT_EMAIL_DETAILS,
		dynamicTemplateData: {
			title: 'Click the link below to verify your email:',
			buttonText: 'Verify Email',
			buttonUrl: signInUrl,
			subject: 'Verify Your Email for Apricot',
		},
		templateId: EmailTemplateId.DEFAULT,
	});
}

export async function sendDeviceVerificationEmail(email: string, token: string) {
	await sendEmail({
		to: email,
		from: APRICOT_ACCOUNT_EMAIL_DETAILS,
		dynamicTemplateData: {
			body: 'Use the code below to verify your new device:',
			otp: token,
			subject: 'Apricot new device verification',
		},
		templateId: EmailTemplateId.OTP,
	});
}

export async function sendAssignedEmail(email: string, patient: Patient) {
	const detailUrl = `${env.NEXTAUTH_URL}/field/patient/${patient.id}`;
	await sendEmail({
		to: email,
		from: APRICOT_ACCOUNT_EMAIL_DETAILS,
		dynamicTemplateData: {
			title: 'A new patient has been assigned to you',
			buttonText: 'View',
			buttonUrl: detailUrl,
			subject: 'New patient assigned to you in Apricot',
		},
		templateId: EmailTemplateId.DEFAULT,
	});
}

export async function sendReadyForSignoffEmail(email: string, patientId: number) {
	const detailUrl = `${env.NEXTAUTH_URL}/field/patient/${patientId}`;
	await sendEmail({
		to: email,
		from: APRICOT_ACCOUNT_EMAIL_DETAILS,
		dynamicTemplateData: {
			title: 'Draft documentation for one of your patients is ready for review.',
			buttonText: 'Review',
			buttonUrl: detailUrl,
			subject: 'You have documentation to review.',
		},
		templateId: EmailTemplateId.DEFAULT,
	});
}

export async function sendResetPasswordEmail(email: string, token: string) {
	const signInUrl = `${env.NEXTAUTH_URL}/auth/reset-password?email=${encodeURIComponent(
		email,
	)}&token=${encodeURIComponent(token)}`;
	await sendEmail({
		to: email,
		from: APRICOT_ACCOUNT_EMAIL_DETAILS,
		dynamicTemplateData: {
			title: 'Click the link below to reset your password:',
			buttonText: 'Reset Password',
			buttonUrl: signInUrl,
			subject: 'Reset Your Password for Apricot',
		},
		templateId: EmailTemplateId.DEFAULT,
	});
}

export const sendCaseManagerAssignedEmail = async (email: string, patientId: number) => {
	const detailUrl = `${env.NEXTAUTH_URL}/field/patient/${patientId}`;
	await sendEmail({
		to: email,
		from: APRICOT_ACCOUNT_EMAIL_DETAILS,
		dynamicTemplateData: {
			title: 'A new patient has been added to your schedule.',
			buttonText: 'View',
			buttonUrl: detailUrl,
			subject: 'A new patient has been assigned to you in Apricot.',
		},
		templateId: EmailTemplateId.DEFAULT,
	});
};

export const sendQaManagerAssignedEmail = async (email: string, patientId: number) => {
	const detailUrl = `${env.NEXTAUTH_URL}/office/patient/${patientId}`;
	await sendEmail({
		to: email,
		from: APRICOT_ACCOUNT_EMAIL_DETAILS,
		dynamicTemplateData: {
			title: 'A documentation draft is ready to be assigned for QA.',
			buttonText: 'View',
			buttonUrl: detailUrl,
			subject: 'Documentation draft is ready for QA.',
		},
		templateId: EmailTemplateId.DEFAULT,
	});
};

export const sendQaAssignedEmail = async (email: string, patientId: number) => {
	const detailUrl = `${env.NEXTAUTH_URL}/office/patient/${patientId}`;
	await sendEmail({
		to: email,
		from: APRICOT_ACCOUNT_EMAIL_DETAILS,
		dynamicTemplateData: {
			title: 'A documentation draft is ready for QA.',
			buttonText: 'View',
			buttonUrl: detailUrl,
			subject: 'Documentation draft is ready for QA.',
		},
		templateId: EmailTemplateId.DEFAULT,
	});
};

export const sendDataEntryAssignedEmail = async (email: string, patientId: number, nurseName: string) => {
	const detailUrl = `${env.NEXTAUTH_URL}/office/patient/${patientId}`;
	await sendEmail({
		to: email,
		from: APRICOT_ACCOUNT_EMAIL_DETAILS,
		dynamicTemplateData: {
			title: `Documentation has been approved by ${nurseName} and is ready to be assigned for data entry.`,
			buttonText: 'View',
			buttonUrl: detailUrl,
			subject: 'Documentation ready for data entry.',
		},
		templateId: EmailTemplateId.DEFAULT,
	});
};

export const patientStatusCompletedEmail = async (email: string, patientId: number) => {
	const detailUrl = `${env.NEXTAUTH_URL}/office/patient/${patientId}`;
	await sendEmail({
		to: email,
		from: APRICOT_ACCOUNT_EMAIL_DETAILS,
		dynamicTemplateData: {
			title: 'Patient record has been entered into your EMR and is ready for review.',
			buttonText: 'View Patient in Apricot',
			buttonUrl: detailUrl,
			subject: 'Patient record is complete.',
		},
		templateId: EmailTemplateId.DEFAULT,
	});
};
const monthName = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

export const sendNurseToRemindEmail = async (
	email: string,
	duration: number | undefined,
	visitDate: Date | undefined | null,
	patientId: number | undefined,
) => {
	const d = new Date(visitDate!);
	const body = `Don't forget to complete the SOC interview for ${duration === 1 ? 'yesterday' : `${monthName[d.getMonth()]} ${d.getDate()}`}'s visit! You can also update the SOC date from the patient's Information tab or click the patient status to mark the patient as a non-admit.`;
	const subject = 'Reminder: You have a SOC Interview to complete';
	const CTAPrimaryText = "Let's do this!";
	const CTAPrimaryUrl = `${env.NEXTAUTH_URL}/office/patient/${patientId}?currentTab=Information`;
	const CTASecondaryText = 'Change date or mark as non-admit';
	const CTASecondaryUrl = `${env.NEXTAUTH_URL}/office/patient/${patientId}?currentTab=Information`;
	// console.log('Sent email to: ', email, '\nSubject: ', subject, '\nBody: ', body, '\n', email);

	await sendEmail({
		to: email,
		from: APRICOT_ACCOUNT_EMAIL_DETAILS,
		dynamicTemplateData: {
			body,
			subject,
			CTAPrimaryText,
			CTAPrimaryUrl,
			CTASecondaryText,
			CTASecondaryUrl,
		},
		templateId: EmailTemplateId.DEFAULT,
	});
};
