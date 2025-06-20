import request from 'supertest';
import app from '../../src/app';
import { describe, test, expect } from '@jest/globals';
import setupTestDB from '../utils/setupTestDb';

setupTestDB();

describe('Apps routes', () => {
	describe('POST /1/apps', () => {
		test('should create app', async () => {
			const register = await request(app)
				.post('/1/auth/register')
				.send({
					firstName: 'Brian',
					lastName: 'Morton',
					password: 'testpassword',
					email: 'test@gmail.com',
				})
				.expect(200);

			const response = await request(app)
				.post('/1/apps')
				.set('Cookie', register.headers['set-cookie'])
				.send({
					name: 'First app',
				})
				.expect(200);

			expect(response.body).toEqual({
				id: expect.any(Number),
				name: 'First app',
				apiKey: expect.any(String),
				appId: expect.any(String),
			});
		});
	});
});
