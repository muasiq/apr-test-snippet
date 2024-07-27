import { DocumentProcessorServiceClient, protos } from '@google-cloud/documentai';
import { Paragraph } from '@prisma/client';
import { orderBy, random } from 'lodash';
import logger from '~/common/utils/logger';
import { env } from '../../../../env.mjs';
import { PatientArtifactWithDocument } from '../../routers/patientArtifact/patientArtifact.types';
import { cloudStorage } from './cloudStorage';

const processorId = '85788b8f727c50bc';
const location = 'us';
const processorName = `projects/${env.GOOGLE_CLOUD_PROJECT_ID}/locations/${location}/processors/${processorId}`;

const shouldMockDocumentAi = env.GOOGLE_CLOUD_PROJECT_ID === 'localhost';
const documentaiClient = setupDocumentAiClient();

export const cloudDocumentAI = {
	async processDocument(artifact: PatientArtifactWithDocument) {
		if (!artifact.patientDocumentArtifact || !artifact.cloudStorageLocation) {
			throw new Error(`No patientDocumentArtifact found for artifact: ${artifact.id}`);
		}
		const location = cloudStorage.location(artifact.cloudStorageLocation);
		const [operation] = await documentaiClient.batchProcessDocuments({
			name: processorName,
			inputDocuments: {
				gcsDocuments: {
					documents: [
						{
							gcsUri: location,
							mimeType: artifact.fileType,
						},
					],
				},
			},
			processOptions: {
				ocrConfig: {
					enableNativePdfParsing: true,
					hints: {
						languageHints: ['en'],
					},
				},
			},
			documentOutputConfig: {
				gcsOutputConfig: {
					gcsUri: artifact.patientDocumentArtifact.documentExtractionOutputLocation,
				},
			},
		});

		logger.debug('Waiting for batch process documents operation to complete...');
		await operation.promise();

		logger.debug('Operation Complete for documentId', artifact.id);
		const metadata = operation.metadata as protos.google.cloud.documentai.v1.IBatchProcessMetadata;
		const outputLocation = metadata.individualProcessStatuses![0]?.outputGcsDestination;

		if (!outputLocation) {
			throw new Error('No output location found');
		}

		const [, outputName] = outputLocation.split(cloudStorage.location(''));

		const query = {
			prefix: outputName,
		};

		logger.info('Fetching results ...');

		const [files] = await cloudStorage.bucket().getFiles(query);

		const orderedFiles = orderBy(files, (file) => {
			const regex = /.*-(.+)\.json/;
			const match = file.name.match(regex);
			const string = match ? match[1] : 0;
			return Number(string);
		});

		let rawText = '';
		let pages: protos.google.cloud.documentai.v1.IDocument['pages'] = [];

		for (const file of orderedFiles) {
			logger.info(`Processing file: ${file.name}`);
			const downloadedFile = await file.download();
			const document = JSON.parse(downloadedFile.toString()) as protos.google.cloud.documentai.v1.IDocument;
			const resolvedPages = document.pages ?? [];
			pages = [...pages, ...resolvedPages];
			rawText += document.text;
		}

		const paragraphs = pages
			.flatMap((p, pageIndex) =>
				p.paragraphs?.map((paragraph, index) => {
					const { startIndex, endIndex } = getStartAndEndIndexes(paragraph?.layout?.textAnchor as TextAnchor);
					return {
						page: pageIndex + 1,
						positionOnPage: index + 1,
						startIndex,
						endIndex,
					};
				}),
			)
			.filter((p) => p) as Paragraph[];

		logger.info('updating raw text and paragraphs for document id=', artifact.id);
		const resolvedOutputName = shouldMockDocumentAi ? `output-${random(10000)}.json` : outputName;
		return { paragraphs, rawText, outputName: resolvedOutputName };
	},
};

function setupDocumentAiClient() {
	if (shouldMockDocumentAi) {
		return {
			batchProcessDocuments: () => {
				return [
					{
						metadata: {
							individualProcessStatuses: [
								{ outputGcsDestination: `${cloudStorage.location('')}/ocr-sample.json` },
							],
						},
						promise: () => {
							return Promise.resolve();
						},
					},
				];
			},
		};
	}
	return new DocumentProcessorServiceClient({
		credentials: {
			client_email: env.GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT,
			private_key: env.GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
		},
	});
}

type TextAnchor = {
	textSegments: { startIndex?: string; endIndex: string }[];
};
function getStartAndEndIndexes(textAnchor: TextAnchor) {
	if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
		throw new Error('Text anchor does not have text segments');
	}

	// First shard in document doesn't have startIndex property
	const startIndex = Number(textAnchor.textSegments[0]?.startIndex ?? 0);
	const endIndex = Number(textAnchor.textSegments[0]?.endIndex);

	return { startIndex, endIndex };
}
