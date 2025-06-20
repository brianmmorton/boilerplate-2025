import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';
import os from 'os';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envVarsSchema = Joi.object()
	.keys({
		NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
		PORT: Joi.number().default(3030),
		JWT_SECRET: Joi.string().required().description('JWT secret key'),
		JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
			.default(30)
			.description('minutes after which access tokens expire'),
		JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
			.default(30)
			.description('days after which refresh tokens expire'),
		JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
			.default(10)
			.description('minutes after which reset password token expires'),
		JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
			.default(10)
			.description('minutes after which verify email token expires'),
		SMTP_HOST: Joi.string().description('server that will send the emails'),
		SMTP_PORT: Joi.number().description('port to connect to the email server'),
		SMTP_USERNAME: Joi.string().description('username for email server'),
		SMTP_PASSWORD: Joi.string().description('password for email server'),
		EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
		REDIS_URL: Joi.string().required().description('Redis connection URL'),
		STRIPE_SECRET_KEY: Joi.string().description('Stripe secret key'),
		STRIPE_WEBHOOK_SECRET: Joi.string().description('Stripe webhook secret'),
		STRIPE_PRICE_ID: Joi.string().description('Stripe price ID'),
		STRIPE_PUBLIC_KEY: Joi.string().description('Stripe public key'),
		STRIPE_PRICE_STANDARD: Joi.string().description('Stripe price ID for standard subscription'),
		STRIPE_PRICE_STANDARD_PLUS: Joi.string().description(
			'Stripe price ID for standard plus subscription',
		),
		STRIPE_PRICE_PREMIUM: Joi.string().description('Stripe price ID for premium subscription'),
		STRIPE_PRICE_ENTERPRISE: Joi.string().description(
			'Stripe price ID for enterprise subscription',
		),
		REDDIT_CLIENT_ID: Joi.string().description('Reddit client ID'),
		REDDIT_CLIENT_SECRET: Joi.string().description('Reddit client secret'),
		TAVILY_API_KEY: Joi.string().description('Tavily API key'),
	})
	.unknown();

const { value: envVars, error } = envVarsSchema
	.prefs({ errors: { label: 'key' } })
	.validate(process.env);

if (error) {
	throw new Error(`Config validation error: ${error.message}`);
}

export default {
	env: envVars.NODE_ENV,
	port: envVars.PORT,
	jwt: {
		secret: envVars.JWT_SECRET,
		accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
		refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
		resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
		verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
	},
	email: {
		smtp: {
			host: envVars.SMTP_HOST,
			port: envVars.SMTP_PORT,
			auth: {
				user: envVars.SMTP_USERNAME,
				pass: envVars.SMTP_PASSWORD,
			},
		},
		from: envVars.EMAIL_FROM,
	},
	gemini: {
		apiKey: envVars.GEMINI_API_KEY || '',
	},
	redis: {
		url: envVars.REDIS_URL,
	},
	numCPUs: envVars.NODE_ENV === 'production' ? os.cpus().length : 2,
	stripe: {
		secretKey: envVars.STRIPE_SECRET_KEY || '',
		webhookSecret: envVars.STRIPE_WEBHOOK_SECRET || '',
		priceId: envVars.STRIPE_PRICE_ID || '',
		publicKey: envVars.STRIPE_PUBLIC_KEY || '',
		prices: {
			standard: envVars.STRIPE_PRICE_STANDARD || envVars.STRIPE_PRICE_ID || '',
			standardPlus: envVars.STRIPE_PRICE_STANDARD_PLUS || '',
			premium: envVars.STRIPE_PRICE_PREMIUM || '',
			enterprise: envVars.STRIPE_PRICE_ENTERPRISE || '',
		},
	},
	reddit: {
		clientId: envVars.REDDIT_CLIENT_ID || '',
		clientSecret: envVars.REDDIT_CLIENT_SECRET || '',
	},
	tavily: {
		apiKey: envVars.TAVILY_API_KEY || '',
	},
};
