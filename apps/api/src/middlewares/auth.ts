import passport from 'passport';
import httpStatus from 'http-status';
import { ApiError } from '../utils/ApiError';
import { NextFunction, Request, Response } from 'express';
import { Company, User } from '@prisma/client';

export type UserAuthContext = {
	user: Pick<User, 'id' | 'firstName' | 'lastName' | 'isEmailVerified' | 'role' | 'email'> & {
		companies: Pick<Company, 'id'>[];
	};
};

const verifyCallback =
	(
		req: any,
		resolve: (value: UserAuthContext) => void,
		reject: (reason?: unknown) => void,
		requiredRights: ('USER' | 'ADMIN')[],
	) =>
	async (err: unknown, user: UserAuthContext['user'] | false, info: unknown) => {
		if (err || info || !user) {
			return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
		}
		req.user = user;

		if (requiredRights.length) {
			if (requiredRights.includes('ADMIN')) {
				if (user.role !== 'ADMIN') {
					return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
				}
			}

			if (requiredRights.includes('USER')) {
				if (!['USER', 'ADMIN'].includes(user.role)) {
					return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
				}
			}
		}

		resolve({ user });
	};

const auth =
	(...requiredRights: ('USER' | 'ADMIN')[]) =>
	async (req: Request, res: Response, next: NextFunction): Promise<UserAuthContext> => {
		return new Promise((resolve, reject) => {
			passport.authenticate(
				'jwt',
				{ session: false },
				verifyCallback(req, resolve, reject, requiredRights),
			)(req, res, next);
		});
	};

export default auth;
