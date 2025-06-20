import httpStatus from 'http-status';
import { ApiError } from '../utils/ApiError';
import { Request, Response, NextFunction } from 'express-serve-static-core';

export const cronAuth = (req: Request, res: Response, next: NextFunction) => {
	if (!process.env.CRON_SECRET) {
		return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Secret is not set'));
	}

	const authHeader = req.headers['authorization'] || req.headers['Authorization'];

	if (!authHeader) {
		return next(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized [no auth header]'));
	}

	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return next(new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized'));
	}

	next();
};
