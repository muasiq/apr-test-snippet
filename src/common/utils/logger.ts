import { LoggingWinston } from '@google-cloud/logging-winston';
import winston from 'winston';

const isProduction = process.env.APRICOT_ENV === 'production' || process.env.APRICOT_ENV === 'staging';
const transports = isProduction
	? [new LoggingWinston({ redirectToStdout: true, useMessageField: false })]
	: [new winston.transports.Console({ format: winston.format.simple() })];

const logger = winston.createLogger({
	level: 'info',
	transports,
});

process.on('unhandledRejection', (error) => {
	logger.error('Unhandled Rejection:', typeof error === 'string' ? { error } : error);
});

export default logger;
