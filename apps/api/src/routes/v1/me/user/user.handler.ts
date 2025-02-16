import { z } from 'zod';
import prisma from '@app/client';
import { Handler } from '@app/utils/Handler';
import auth from '@app/middlewares/auth';

export const getUserHandler = new Handler({
	auth: auth('USER'),
	validator: {
		params: z.any(),
		body: z.any(),
		query: z.any()
	},
	handler: async ({ context }) => {
		const user = await prisma.user.findUnique({
			where: {
				id: context.user.id
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				email: true
			}
		});

		return user;
	}
});
