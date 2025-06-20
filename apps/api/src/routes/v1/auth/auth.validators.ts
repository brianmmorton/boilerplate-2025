import { z } from 'zod';

export const RegisterSchema = z.object({
	email: z.string().email(),
	firstName: z.string(),
	lastName: z.string(),
	password: z.string().min(8),
});

export const LoginSchema = z.object({
	email: z.string(),
	password: z.string(),
});

export const LogoutSchema = z.object({
	refreshToken: z.string(),
});

export const ForgotPasswordSchema = z.object({
	email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
	password: z.string().min(8),
});

export const VerifyEmailSchema = z.object({
	token: z.string(),
});
