import { authService, userService, tokenService, emailService } from '../../../services';
import exclude from '../../../utils/exclude';
import {
	ForgotPasswordSchema,
	LoginSchema,
	LogoutSchema,
	RegisterSchema,
	ResetPasswordSchema,
	VerifyEmailSchema,
} from './auth.validators';
import { Handler } from '../Handler';
import { z } from 'zod';
import auth from '../../../middlewares/auth';
import { router } from '../router';

export const registerHandler = new Handler(router, {
	validator: {
		body: RegisterSchema,
		query: z.any(),
		params: z.any(),
	},
	method: 'POST',
	routePath: '/auth/register',
	auth: undefined,
	handler: async ({ body }) => {
		const user = await userService.createUser(
			body.email,
			body.firstName,
			body.lastName,
			body.password,
		);
		const userWithoutPassword = exclude(user, ['password', 'createdAt', 'updatedAt']);
		const tokens = await tokenService.generateAuthTokens(user);
		return { user: userWithoutPassword, tokens };
	},
});

export const loginHandler = new Handler(router, {
	validator: {
		body: LoginSchema,
		query: z.any(),
		params: z.any(),
	},
	method: 'POST',
	routePath: '/auth/login',
	auth: undefined,
	handler: async ({ body }) => {
		const user = await authService.loginUserWithEmailAndPassword(body.email, body.password);
		const tokens = await tokenService.generateAuthTokens(user);

		return { user, tokens };
	},
});

export const logoutHandler = new Handler(router, {
	validator: {
		body: LogoutSchema,
		query: z.any(),
		params: z.any(),
	},
	method: 'POST',
	routePath: '/auth/logout',
	auth: undefined,
	handler: async ({ body }) => {
		await authService.logout(body.refreshToken);

		return {};
	},
});

export const refreshTokensHandler = new Handler(router, {
	validator: {
		body: z.object({
			refreshToken: z.string(),
		}),
		query: z.any(),
		params: z.any(),
	},
	method: 'POST',
	routePath: '/auth/refresh-tokens',
	auth: undefined,
	handler: async ({ body }) => {
		const tokens = await authService.refreshAuth(body.refreshToken);

		return { ...tokens };
	},
});

export const forgotPasswordHandler = new Handler(router, {
	validator: {
		body: ForgotPasswordSchema,
		query: z.any(),
		params: z.any(),
	},
	method: 'POST',
	routePath: '/auth/forgot-password',
	auth: undefined,
	handler: async ({ body }) => {
		const resetPasswordToken = await tokenService.generateResetPasswordToken(body.email);
		await emailService.sendResetPasswordEmail(body.email, resetPasswordToken);
		return {};
	},
});

export const resetPasswordHandler = new Handler(router, {
	validator: {
		body: ResetPasswordSchema,
		query: VerifyEmailSchema,
		params: z.any(),
	},
	method: 'POST',
	routePath: '/auth/reset-password',
	auth: undefined,
	handler: async ({ body, query }) => {
		await authService.resetPassword(query.token, body.password);
		return {};
	},
});

export const sendVerificationEmailHandler = new Handler(router, {
	validator: {
		body: z.any(),
		query: z.any(),
		params: z.any(),
	},
	method: 'POST',
	routePath: '/auth/send-verification-email',
	auth: auth('USER'),
	handler: async ({ context }) => {
		const { user } = context;
		const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
		await emailService.sendVerificationEmail(user.email, verifyEmailToken);
		return {};
	},
});

export const verifyEmailHandler = new Handler(router, {
	validator: {
		body: z.any(),
		query: VerifyEmailSchema,
		params: z.any(),
	},
	method: 'POST',
	routePath: '/auth/verify-email',
	auth: undefined,
	handler: async ({ query }) => {
		await authService.verifyEmail(query.token as string);
		return {};
	},
});
