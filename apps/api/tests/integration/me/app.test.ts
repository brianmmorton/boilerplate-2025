import request from 'supertest';
import app from '../../../src/app';
import { describe, test, expect } from '@jest/globals';
import setupTestDB from '../../utils/setupTestDb';

setupTestDB();

describe('Me: App routes', () => {
	describe('GET /1/me/app', () => {
		test('should return null if it doesnt exist', async () => {
			const register = await request(app)
				.post('/1/auth/register')
				.send({
					firstName: 'Brian',
					lastName: 'Morton',
					password: 'testpassword',
					email: 'test@gmail.com',
				})
				.expect(200);

			const res = await request(app)
				.get('/1/me/app')
				.set({
					'X-API-Key': 'testAppSecret',
					'X-API-AppId': 'testAppId',
					'x-client-id': '0.10.0',
					'x-session-id': 'session-2',
					'x-user-id': 'user-1',
				})
				.set('Cookie', register.headers['set-cookie'])
				.expect(200);

			expect(res.body).toEqual(null);
		});

		test('should return app', async () => {
			const register = await request(app)
				.post('/1/auth/register')
				.send({
					firstName: 'Brian',
					lastName: 'Morton',
					password: 'testpassword',
					email: 'test@gmail.com',
				})
				.expect(200);

			await request(app)
				.post('/1/apps')
				.set('Cookie', register.headers['set-cookie'])
				.send({
					name: 'First app',
				})
				.expect(200);

			const res = await request(app)
				.get('/1/me/app')
				.set({
					'X-API-Key': 'testAppSecret',
					'X-API-AppId': 'testAppId',
					'x-client-id': '0.10.0',
					'x-session-id': 'session-2',
					'x-user-id': 'user-1',
				})
				.set('Cookie', register.headers['set-cookie'])
				.expect(200);

			expect(res.body).toEqual({
				id: expect.any(Number),
				name: 'First app',
				icon: null,
				features: [],
			});
		});
	});
});
