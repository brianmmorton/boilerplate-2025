import httpStatus from 'http-status';
import { ApiError } from '@app/utils/ApiError';
import { Request } from 'express';
import bcrypt from 'bcrypt';
import prisma from '@app/client';
import { Environment } from '@prisma/client';
import { BoilerplateSession } from '@app/types/BoilerplateSession';

export type ApiAuthContext = {
	app: {
		id: number;
		name: string;
	};
	clientVersion: string;
	session: BoilerplateSession;
	environment: Environment;
};

const isValidEnvironment = (environment: string): environment is Environment =>
	[Environment.Development, Environment.Production, Environment.Staging].includes(
		environment as Environment
	);

export const apiAuth = async (req: Request): Promise<ApiAuthContext> => {
	const appId = req.headers['x-api-appid'];
	const apiKey = req.headers['x-api-key'];

	if (!apiKey || typeof apiKey !== 'string') {
		throw new ApiError(httpStatus.FORBIDDEN, 'Invalid API Key');
	}

	if (!appId || typeof appId !== 'string') {
		throw new ApiError(httpStatus.FORBIDDEN, 'Invalid App Id');
	}

	const app = await prisma.app.findFirst({
		where: {
			appId
		},
		select: {
			hashedApiKey: true,
			id: true,
			name: true
		}
	});

	if (!app) {
		throw new ApiError(httpStatus.FORBIDDEN, 'Invalid App Id');
	}

	const isMatch = await bcrypt.compare(apiKey, app.hashedApiKey);

	if (!isMatch) {
		throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
	}

	const clientVersion = req.headers['x-client-version'];

	if (!clientVersion || typeof clientVersion !== 'string') {
		throw new ApiError(httpStatus.FORBIDDEN, 'Include x-client-version version in headers');
	}

	const environment = req.headers['x-environment'];

	if (!environment || typeof environment !== 'string') {
		throw new ApiError(httpStatus.FORBIDDEN, 'Include x-environment in headers');
	} else if (!isValidEnvironment(environment)) {
		throw new ApiError(
			httpStatus.FORBIDDEN,
			'Invalid environment specified, should be "Development", "Production", or "Staging".'
		);
	}

	const sessionId = req.headers['x-session-id'];

	if (!sessionId || typeof sessionId !== 'string') {
		throw new ApiError(httpStatus.FORBIDDEN, 'Include x-session-id in headers');
	}

	const userId = typeof req.headers['x-user-id'] === 'string' ? req.headers['x-user-id'] : null;

	const sessionSelect = {
		id: true,
		appId: true,
		userId: true,
		sessionId: true,
		environment: true,
		contextPropertyValues: {
			select: {
				id: true,
				value: true,
				contextProperty: {
					select: {
						id: true,
						name: true
					}
				}
			}
		}
	};

	let session: BoilerplateSession | null = null;

	if (userId) {
		session = await prisma.apiSession.findFirst({
			where: {
				userId,
				environment,
				appId: app.id
			},
			select: sessionSelect
		});
	} else {
		session = await prisma.apiSession.findFirst({
			where: {
				sessionId,
				environment,
				appId: app.id
			},
			select: sessionSelect
		});
	}

	if (!session) {
		const newSession = await prisma.apiSession.create({
			data: {
				appId: app.id,
				sessionId,
				environment,
				userId
			}
		});

		session = {
			id: newSession.id,
			sessionId: newSession.sessionId,
			environment: newSession.environment,
			appId: newSession.appId,
			userId: newSession.userId,
			contextPropertyValues: []
		};
	}

	return {
		clientVersion,
		session,
		environment,
		app: {
			id: app.id,
			name: app.name
		}
	};
};
