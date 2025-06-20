import { RequestHandler } from 'express';
import { Request, Response, NextFunction } from 'express-serve-static-core';

export interface CustomParamsDictionary {
	[key: string]: any;
}

const catchAsync =
	<T extends Request = Request, R extends Response = Response>(
		fn: RequestHandler<CustomParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>,
	) =>
	(req: T, res: R, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch((err) => next(err));
	};

export default catchAsync;
