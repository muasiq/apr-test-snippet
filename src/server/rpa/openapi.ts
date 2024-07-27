import { generateOpenApiDocument } from 'trpc-openapi';
import { rpaAppRouter } from '~/server/rpa/root';

// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(rpaAppRouter, {
	title: 'Apricot Api',
	description: 'Api docs for use with RPA tool',
	version: '2.0.0',
	baseUrl: 'https://app.apricot.com/api/v2',
});
