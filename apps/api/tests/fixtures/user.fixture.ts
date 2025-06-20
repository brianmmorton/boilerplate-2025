import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import prisma from '../../src/prismaClient';
import { Prisma, Role } from '@prisma/client';

const password = 'password1';
const salt = bcrypt.genSaltSync(8);

export const userOne = {
	firstName: faker.name.firstName(),
	lastName: faker.name.lastName(),
	email: faker.internet.email().toLowerCase(),
	password,
	role: Role.USER,
	isEmailVerified: false,
};

export const userTwo = {
	firstName: faker.name.firstName(),
	lastName: faker.name.lastName(),
	email: faker.internet.email().toLowerCase(),
	password,
	role: Role.USER,
	isEmailVerified: false,
};

export const admin = {
	firstName: faker.name.firstName(),
	lastName: faker.name.lastName(),
	email: faker.internet.email().toLowerCase(),
	password,
	role: Role.ADMIN,
	isEmailVerified: false,
};

export const insertUsers = async (users: Prisma.UserCreateManyInput[]) => {
	await prisma.user.createMany({
		data: users.map((user) => ({ ...user, password: bcrypt.hashSync(user.password, salt) })),
	});
};
