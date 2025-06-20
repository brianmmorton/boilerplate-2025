import prisma from '../prismaClient';
import { Strategy as JwtStrategy, VerifyCallback } from 'passport-jwt';
import config from './config';
import { TokenType } from '@prisma/client';
import { Request } from 'express';

const cookieOrHeaderExtractor = (req: Request) => {
	let token = null;
	if (req && req.cookies) {
		token = req.cookies['token'];
	}

	if (!token) {
		token = req.headers['authorization']?.split(' ')[1];
	}

	return token;
};

const jwtOptions = {
	secretOrKey: config.jwt.secret,
	jwtFromRequest: cookieOrHeaderExtractor,
};

const jwtVerify: VerifyCallback = async (payload, done) => {
	try {
		if (payload.type !== TokenType.ACCESS) {
			throw new Error('Invalid token type');
		}

		const user = await prisma.user.findUnique({
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
			},
			where: { id: payload.sub },
		});

		if (!user) {
			return done(null, false);
		}

		done(null, user);
	} catch (error) {
		done(error, false);
	}
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
