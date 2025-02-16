import { z } from 'zod';
import { apiAuth } from '../middlewares/api-auth';
import auth from '../middlewares/auth';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import validate from '../middlewares/validate';

type AuthorizationMiddleware = typeof apiAuth | ReturnType<typeof auth>;

type Validator = Parameters<typeof validate>[0];

export class Handler<
	Auth extends AuthorizationMiddleware,
	TValidator extends Validator,
	HandlerReturnType extends object | string | number | null,
	Context = Auth extends undefined ? undefined : Awaited<ReturnType<Auth>>,
	RequestContext = {
		body: z.infer<TValidator['body']>;
		query: z.infer<TValidator['query']>;
		params: z.infer<TValidator['params']>;
		cookies: Request['cookies'];
		context: Context;
		res: Response;
	}
> {
	private auth?: Auth;
	private validate?: ReturnType<typeof validate<TValidator>>;
	public handler: (context: RequestContext) => Promise<HandlerReturnType>;

	constructor({
		auth,
		validator,
		handler
	}: {
		auth?: Auth;
		validator?: TValidator;
		handler: (context: RequestContext) => Promise<HandlerReturnType>;
	}) {
		this.auth = auth;
		this.validate = validator ? validate(validator) : undefined;
		this.handler = handler;
	}

	public requestHandler = async <T extends Request = Request, R extends Response = Response>(
		req: T,
		res: R,
		next: NextFunction
	) => {
		try {
			// @ts-expect-error Not sure
			let context: RequestContext = {
				req,
				res,
				body: undefined,
				query: undefined,
				params: undefined,
				cookies: req.cookies,
				context: {}
			};

			if (this.auth) {
				context = {
					...context,
					context: await this.auth(req, res, next)
				};
			}

			if (this.validate) {
				const data = this.validate(req) as {
					body: z.infer<TValidator['body']>;
					query: z.infer<TValidator['query']>;
					params: z.infer<TValidator['params']>;
				};
				const response = await this.handler({
					...context,
					...data
				});

				res.json(response);
			} else {
				const response = await this.handler(context);

				res.json(response);
			}
		} catch (err) {
			next(err);
		}
	};
}
