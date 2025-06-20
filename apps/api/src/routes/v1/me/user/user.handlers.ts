import { z } from 'zod';
import prisma from '../../../../prismaClient';
import { Handler } from '../../Handler';
import auth from '../../../../middlewares/auth';
import { router } from '../../router';

export const getUserHandler = new Handler(router, {
	auth: auth('USER'),
	method: 'GET',
	routePath: '/me/user',
	validator: {
		params: z.any(),
		body: z.any(),
		query: z.any(),
	},
	handler: async ({ context }) => {
		const user = await prisma.user.findUnique({
			where: {
				id: context.user.id,
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				email: true,
			},
		});

		return user;
	},
});
