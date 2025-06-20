import winston from 'winston';
import config from './config';

const enumerateErrorFormat = winston.format((info) => {
	if (info instanceof Error) {
		Object.assign(info, { message: info.stack });
	}
	return info;
});

export const logger = winston.createLogger({
	level: config.env === 'development' ? 'debug' : 'info',
	format: winston.format.combine(
		enumerateErrorFormat(),
		config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
		winston.format.splat(),
		winston.format.printf(({ level, message, name, ...metadata }) => {
			const loggerName = name ? `[${name}] ` : '';
			let logMessage = `${level}: ${loggerName}${message}`;

			// Get the actual metadata from Symbol(splat)
			const splatSymbol = Object.getOwnPropertySymbols(metadata).find(
				(symbol) => symbol.toString() === 'Symbol(splat)',
			);

			if (splatSymbol && Array.isArray(metadata[splatSymbol]) && metadata[splatSymbol].length > 0) {
				// Get the first item from splat array which contains our metadata
				const actualMetadata = metadata[splatSymbol][0];
				logMessage += ` ${JSON.stringify(actualMetadata, null, 2)}`;
			}

			return logMessage;
		}),
	),
	transports: [
		new winston.transports.Console({
			stderrLevels: ['error'],
		}),
	],
});

export default logger;
