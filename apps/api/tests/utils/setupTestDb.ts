import prisma from '../../src/prismaClient';
import { beforeAll, beforeEach, afterAll } from '@jest/globals';

const setupTestDB = () => {
	beforeAll(async () => {
		await prisma.$connect();
	});

	const clear = async () => {
		await prisma.token.deleteMany();
		await prisma.event.deleteMany();
		await prisma.activeEvent.deleteMany();
		await prisma.error.deleteMany();
		await prisma.apiSession.deleteMany();
		await prisma.membership.deleteMany();
		await prisma.featureInteraction.deleteMany();
		await prisma.feature.deleteMany();
		await prisma.app.deleteMany();
		await prisma.user.deleteMany();
	};

	beforeEach(clear);
	afterAll(clear);
};

export default setupTestDB;
