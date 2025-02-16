import { Environment } from '@prisma/client';
import { BoilerplateSession } from '../../src/types/BoilerplateSession';

declare module 'express-serve-static-core' {
	interface Request {
		context: {
			app: {
				id: number;
				name: string;
			};
			clientVersion: string;
			session: BoilerplateSession | null;
			environment: Environment;
		};
		user: {
			id: number;
			firstName: string;
			lastName: string;
			email: string;
		};
	}
}
