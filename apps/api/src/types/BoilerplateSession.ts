import { Prisma } from '@prisma/client';

export type BoilerplateSession = Prisma.ApiSessionGetPayload<{
	select: {
		id: true;
		sessionId: true;
		appId: true;
		userId: true;
		environment: true;
		contextPropertyValues: {
			select: {
				id: true;
				value: true;
				contextProperty: {
					select: {
						id: true;
						name: true;
					};
				};
			};
		};
	};
}>;
