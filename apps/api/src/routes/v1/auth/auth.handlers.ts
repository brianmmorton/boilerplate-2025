import { authService, userService, tokenService, emailService } from '@app/services';
import exclude from '@app/utils/exclude';
import {
	ForgotPasswordSchema,
	LoginSchema,
	LogoutSchema,
	RegisterSchema,
	ResetPasswordSchema,
	VerifyEmailSchema
} from './auth.validators';
import { Handler } from '@app/utils/Handler';
import { z } from 'zod';
import auth from '@app/middlewares/auth';

export const registerHandler = new Handler({
	validator: {
		body: RegisterSchema,
		query: z.any(),
		params: z.any()
	},
	auth: undefined,
	handler: async ({ body, res }) => {
		const user = await userService.createUser(
			body.email,
			body.firstName,
			body.lastName,
			body.password
		);
		const userWithoutPassword = exclude(user, ['password', 'createdAt', 'updatedAt']);
		const tokens = await tokenService.generateAuthTokens(user);

		res.cookie('token', tokens.access.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
			sameSite: 'strict'
		});
		res.cookie('refresh_token', tokens.refresh.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
			sameSite: 'strict'
		});

		return { user: userWithoutPassword, tokens };
	}
});

export const loginHandler = new Handler({
	validator: {
		body: LoginSchema,
		query: z.any(),
		params: z.any()
	},
	auth: undefined,
	handler: async ({ body, res }) => {
		const user = await authService.loginUserWithEmailAndPassword(body.email, body.password);
		const tokens = await tokenService.generateAuthTokens(user);

		res.cookie('token', tokens.access.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
			sameSite: 'strict'
		});
		res.cookie('refresh_token', tokens.refresh.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
			sameSite: 'strict'
		});

		return { user, tokens };
	}
});

export const logoutHandler = new Handler({
	validator: {
		body: LogoutSchema,
		query: z.any(),
		params: z.any()
	},
	auth: undefined,
	handler: async ({ body, res }) => {
		await authService.logout(body.refreshToken);

		res.cookie('token', '', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
			sameSite: 'strict'
		});
		res.cookie('refresh_token', '', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
			sameSite: 'strict'
		});

		return {};
	}
});

export const refreshTokensHandler = new Handler({
	validator: {
		body: z.any(),
		query: z.any(),
		params: z.any()
	},
	auth: undefined,
	handler: async ({ res, cookies }) => {
		const tokens = await authService.refreshAuth(cookies.refresh_token);

		res.cookie('token', tokens.access.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
			sameSite: 'strict'
		});
		res.cookie('refresh_token', tokens.refresh.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
			sameSite: 'strict'
		});

		return { ...tokens };
	}
});

export const forgotPasswordHandler = new Handler({
	validator: {
		body: ForgotPasswordSchema,
		query: z.any(),
		params: z.any()
	},
	auth: undefined,
	handler: async ({ body }) => {
		const resetPasswordToken = await tokenService.generateResetPasswordToken(body.email);
		await emailService.sendResetPasswordEmail(body.email, resetPasswordToken);
		return {};
	}
});

export const resetPasswordHandler = new Handler({
	validator: {
		body: ResetPasswordSchema,
		query: VerifyEmailSchema,
		params: z.any()
	},
	auth: undefined,
	handler: async ({ body, query }) => {
		await authService.resetPassword(query.token, body.password);
		return {};
	}
});

export const sendVerificationEmailHandler = new Handler({
	validator: {
		body: z.any(),
		query: z.any(),
		params: z.any()
	},
	auth: auth('USER'),
	handler: async ({ context }) => {
		const { user } = context;
		const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
		await emailService.sendVerificationEmail(user.email, verifyEmailToken);
		return {};
	}
});

export const verifyEmailHandler = new Handler({
	validator: {
		body: z.any(),
		query: VerifyEmailSchema,
		params: z.any()
	},
	auth: undefined,
	handler: async ({ query }) => {
		await authService.verifyEmail(query.token as string);
		return {};
	}
});
