import { z } from 'zod';

type BoilerplateError = z.ZodIssue[];

const isBoilerplateError = (error: BoilerplateError | string | undefined): error is BoilerplateError =>
	Array.isArray(error);

export class ApiError extends Error {
	statusCode: number;
	isOperational: boolean;
	errors?: z.ZodError[];

	constructor(
		statusCode: number,
		message: string | undefined | BoilerplateError,
		isOperational = true,
		stack = ''
	) {
		if (isBoilerplateError(message)) {
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
