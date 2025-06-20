import httpStatus from 'http-status';
import { Request } from 'express';
import z, { ZodType } from 'zod';
import { InvalidError } from '../utils/InvalidError';

type Config = {
	schema?: ZodType;
	data: any;
};

type Key = 'body' | 'query' | 'params';

type Params = {
	body: ZodType;
	query: ZodType;
	params: ZodType;
};

const VoidSchema = z.any();

const validate =
	<TZodSchema extends Params>({
		body = VoidSchema,
		query = VoidSchema,
		params = VoidSchema,
	}: {
		body: TZodSchema['body'];
		query: TZodSchema['query'];
		params: TZodSchema['params'];
	}) =>
	(req: Request) => {
		const items: Record<Key, Config> = {
			body: {
				schema: body,
				data: req.body,
			},
			query: {
				schema: query,
				data: req.query,
			},
			params: {
				schema: params,
				data: req.params,
			},
		};

		const result: Record<Key, z.infer<TZodSchema[Key]> | null> = {
			body: null,
			query: null,
			params: null,
		};

		for (const path of Object.keys(items) as Key[]) {
			const config = items[path as Key];

			if (!config.schema) {
				continue;
			}

			const parsedResult = config.schema.safeParse(config.data);
			if (parsedResult.error) {
				throw new InvalidError(httpStatus.BAD_REQUEST, parsedResult.error.issues);
			}

			result[path] = parsedResult.data;
		}

		return result;
	};

export default validate;
