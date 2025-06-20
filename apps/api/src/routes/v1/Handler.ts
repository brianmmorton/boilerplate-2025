import { z } from 'zod';
import auth from '../../middlewares/auth';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import validate from '../../middlewares/validate';
import { Router } from 'express';
import logger from '../../config/logger';
import { Logger } from 'winston';
import { cronAuth } from '../../middlewares/cronAuth';

/**
 * Type representing an authorization middleware function.
 * Can be either the auth middleware or cronAuth middleware.
 */
export type AuthorizationMiddleware = ReturnType<typeof auth> | typeof cronAuth;

/**
 * Type representing a validator object used for request validation.
 */
export type Validator = Parameters<typeof validate>[0];

/**
 * Generic class for handling API routes with type-safe request validation and authorization.
 *
 * Example
 * export const createUserHandler = new Handler({
 * 	auth: auth('USER'),
 * 	validator: z.object({
 * 		body: z.object({
 * 			name: z.string(),
 * 		}),
 * 		params: z.any(),
 * 		query: z.any(),
 * 	}),
 * 	method: 'POST',
 * 	routePath: '/users',
 * 	handler: async (context) => {
 * 		return {
 * 			message: 'Hello, world!',
 * 		};
 * 	},
 * });
 *
 * @template Auth - The authorization middleware type
 * @template TValidator - The validator schema type
 * @template HandlerReturnType - The return type of the handler function
 * @template Method - The HTTP method (GET, POST, PUT, DELETE)
 * @template RoutePath - The route path string
 * @template Context - The context type derived from the authorization middleware
 * @template RequestContext - The complete request context including body, query, params, etc.
 */
export class Handler<
	Auth extends AuthorizationMiddleware,
	TValidator extends Validator,
	HandlerReturnType extends Promise<object | string | number | null>,
	Method extends 'GET' | 'POST' | 'PUT' | 'DELETE',
	RoutePath extends string,
	Context = Auth extends undefined ? object : Awaited<ReturnType<Auth>>,
	RequestContext = {
		body: z.infer<TValidator['body']>;
		query: z.infer<TValidator['query']>;
		params: z.infer<TValidator['params']>;
		cookies: Request['cookies'];
		context: Context;
		req: Request;
		res: Response;
		next: NextFunction;
		logger: Logger;
	},
> {
	private validate?: ReturnType<typeof validate<TValidator>>;
	public handler: (context: RequestContext) => HandlerReturnType;
	public routePath: RoutePath;
	public method: Method;
	public validator: TValidator;
	public auth?: Auth;
	public key: `${RoutePath}::${Method}`;

	/**
	 * Creates a new Handler instance and registers it with the provided router.
	 *
	 * @param router - The Express router to register the handler with
	 * @param options - Configuration options for the handler
	 * @param options.auth - Optional authorization middleware
	 * @param options.validator - Zod schema for request validation
	 * @param options.method - HTTP method (GET, POST, PUT, DELETE)
	 * @param options.routePath - The route path
	 * @param options.handler - The handler function that processes the request
	 */
	constructor(
		router: Router,
		{
			auth,
			validator,
			method,
			routePath,
			handler,
		}: {
			auth?: Auth;
			validator: TValidator;
			method: Method;
			routePath: RoutePath;
			handler: (context: RequestContext) => HandlerReturnType;
		},
	) {
		this.auth = auth;
		this.validator = validator;
		this.validate = validator ? validate(validator) : undefined;
		this.handler = handler;
		this.routePath = routePath;
		this.method = method;
		this.key = `${routePath}::${method}` as const;

		// @ts-expect-error fix indexing one day
		router[method.toLowerCase()](routePath, this.requestHandler.bind(this));

		// this.apiPathsToHandlersRecord[method]?.set(routePath, this.requestHandler.bind(this));
		// this.apiPathsToArgsRecord[method]?.set(routePath, this.validate);
	}

	/**
	 * Builds the request context by combining request data with authorization context.
	 *
	 * @param req - Express request object
	 * @param res - Express response object
	 * @param next - Express next function
	 * @returns Promise resolving to the complete request context
	 */
	public async buildContext(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<RequestContext> {
		// @ts-expect-error TODO
		const requestContext: RequestContext = {
			req,
			res,
			body: undefined,
			query: undefined,
			params: undefined,
			cookies: req.cookies,
			context: this.auth ? await this.auth(req, res, next) : ({} as Context),
			logger: logger.child({
				routePath: req.path,
				method: req.method,
			}),
		};

		return requestContext;
	}

	/**
	 * Handles incoming HTTP requests by validating the request, building the context,
	 * executing the handler function, and sending the response.
	 *
	 * @param req - Express request object
	 * @param res - Express response object
	 * @param next - Express next function for error handling
	 */
	public async requestHandler<T extends Request = Request, R extends Response = Response>(
		req: T,
		res: R,
		next: NextFunction,
	) {
		try {
			const context = await this.buildContext(req, res, next);

			if (this.validate) {
				const data = this.validate(req) as {
					body: z.infer<TValidator['body']>;
					query: z.infer<TValidator['query']>;
					params: z.infer<TValidator['params']>;
				};
				const response = await this.handler({
					...context,
					...data,
				});

				res.json(response);
			} else {
				const response = await this.handler(context);

				res.json(response);
			}
		} catch (err) {
			next(err);
		}
	}

	// public async runApi<TPath extends string, TMethod extends 'GET' | 'POST' | 'PUT' | 'DELETE'>(
	// 	data: { method: TMethod; path: TPath },
	// 	context: RequestContext,
	// ) {
	// 	const handler = this.apiPathsToHandlersRecord[data.method]?.get(data.path);

	// 	if (!handler) {
	// 		throw new Error(`Handler for ${data.method} ${data.path} not found`);
	// 	}

	// 	// @ts-expect-error fix this
	// 	return handler(context.req, context.res, context.next) as unknown as HandlerReturnType;
	// }
}
