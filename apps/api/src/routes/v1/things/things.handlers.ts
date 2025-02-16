import prisma from '@app/client';
import { CreateThingSchema } from './things.validate';
import { Handler } from '@app/utils/Handler';
import auth from '@app/middlewares/auth';
import { z } from 'zod';

export const createThingHandler = new Handler({
	auth: auth('USER'),
	validator: {
		query: z.any(),
		body: CreateThingSchema,
		params: z.any()
	},
	handler: async ({ context, body }) => {
		const app = await prisma.thing.create({
			data: {
				name: body.name,
				userId: context.user.id
			},
			select: {
				id: true,
				name: true,
			}
		});

		return {
			...app,
		};
	}
});
