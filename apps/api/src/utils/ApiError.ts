import { z } from 'zod';

type ScoutSenseError = z.ZodIssue[];

const isScoutSenseError = (error: ScoutSenseError | string | undefined): error is ScoutSenseError =>
	Array.isArray(error);

export class ApiError extends Error {
	statusCode: number;
	isOperational: boolean;
	errors?: z.ZodError[];

	constructor(
		statusCode: number,
		message: string | undefined | ScoutSenseError,
		isOperational = true,
		stack = '',
	) {
		if (isScoutSenseError(message)) {
			super(JSON.stringify(message));
		} else {
			super(message);
		}

		this.statusCode = statusCode;
		this.isOperational = isOperational;
		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}
