import { z } from 'zod';

export class InvalidError extends Error {
	statusCode: number;
	isOperational: boolean;
	errors: z.ZodIssue[];

	constructor(statusCode: number, errors: z.ZodIssue[], isOperational = true, stack = '') {
		super(JSON.stringify(errors));

		this.errors = errors;
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}
