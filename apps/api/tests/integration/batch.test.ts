import request from 'supertest';
import app from '../../src/app';
import { describe, beforeEach, test, expect } from '@jest/globals';
import prisma from '../../src/prismaClient';
import {
	AddEvent,
	FeatureError,
	RegisterFeature,
	RegisterFeatureInteraction,
} from '../../src/routes/v1/batch/batch.validators';
import setupTestDB from '../utils/setupTestDb';

setupTestDB();

describe('Batch routes', () => {
	let user: {
		id: number;
	};
	let myApp: {
		id: number;
		apiKey: string;
		appId: string;
	};
	let cookies: string[];

	const setupTest = async () => {
		const register = await request(app)
			.post('/1/auth/register')
			.send({
				firstName: 'Brian',
				lastName: 'Morton',
				password: 'testpassword',
				email: 'test@gmail.com',
			})
			.expect(200);

		user = register.body;
		cookies = register.headers['set-cookie'];

		const createApp = await request(app)
			.post('/1/apps')
			.set('Cookie', register.headers['set-cookie'])
			.send({
				name: 'First app',
			})
			.expect(200);

		myApp = createApp.body;
	};

	describe('POST /1/batch', () => {
		beforeEach(async () => {
			await setupTest();
		});

		test('should respond with sessionId if one doesnt exist already', async () => {
			const res = await request(app)
				.post('/1/batch')
				.set({
					'X-API-Key': myApp.apiKey,
					'X-API-AppId': myApp.appId,
					'x-client-version': '0.10.0',
					'x-session-id': 'session-2',
					// 'x-user-id': 'user-1',
					'x-environment': 'Development',
				})
				.send([
					{
						method: 'register-feature',
						time: new Date().toISOString(),
						screenWidth: 400,
						screenHeight: 400,
						language: 'en_US',
						osName: 'MacIntel',
						platform: 'web',
						browserName: 'Chrome',
						userAgent:
							'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
						userId: '1',
						data: {
							featureIdentifier: 'my-feature',
						},
					} as RegisterFeature,
				])
				.expect(200);

			expect(res.body).toMatchObject({
				sessionId: expect.any(String),
			});
		});

		describe('register-feature', () => {
			test('should respond with list of created features', async () => {
				await prisma.apiSession.create({
					data: {
						userId: 'user-1',
						sessionId: 'session-1',
						appId: myApp.id,
						environment: 'Development',
					},
				});

				const res = await request(app)
					.post('/1/batch')
					.set({
						'X-API-Key': myApp.apiKey,
						'X-API-AppId': myApp.appId,
						'x-client-version': '0.10.0',
						'x-session-id': 'session-2',
						'x-user-id': 'user-1',
						'x-environment': 'Development',
					})
					.send([
						{
							method: 'register-feature',
							time: new Date().toISOString(),
							screenWidth: 400,
							screenHeight: 400,
							language: 'en_US',
							osName: 'MacIntel',
							platform: 'web',
							browserName: 'Chrome',
							userAgent:
								'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
							userId: '1',
							data: {
								featureIdentifier: 'my-feature',
							},
						} as RegisterFeature,
					])
					.expect(200);

				expect(res.body).toMatchObject({
					features: [
						{
							identifier: 'my-feature',
							events: [],
							services: [],
							interactions: [],
						},
					],
				});
			});
		});

		describe('add-event', () => {
			test('should register feature then add event', async () => {
				await prisma.apiSession.create({
					data: {
						userId: 'user-1',
						sessionId: 'session-1',
						appId: myApp.id,
						environment: 'Development',
					},
				});

				await request(app)
					.post('/1/batch')
					.set({
						'X-API-Key': myApp.apiKey,
						'X-API-AppId': myApp.appId,
						'x-client-version': '0.10.0',
						'x-session-id': 'session-2',
						'x-user-id': 'user-1',
						'x-environment': 'Development',
					})
					.send([
						{
							method: 'register-feature',
							time: new Date().toISOString(),
							screenWidth: 400,
							screenHeight: 400,
							language: 'en_US',
							osName: 'MacIntel',
							platform: 'web',
							browserName: 'Chrome',
							userAgent:
								'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
							userId: '1',
							data: {
								featureIdentifier: 'my-feature',
							},
						} as RegisterFeature,
					])
					.expect(200);

				const feature = await prisma.feature.findFirst({
					where: {
						appId: myApp.id,
					},
				});

				const activeEventRes = await request(app)
					.put('/1/active-event')
					.send({
						appId: myApp.id,
						featureId: feature!.id,
						environment: 'Development',
						event: 'Impression',
					})
					.set('Cookie', cookies)
					.expect(200);

				const batchRes2 = await request(app)
					.post('/1/batch')
					.set({
						'X-API-Key': myApp.apiKey,
						'X-API-AppId': myApp.appId,
						'x-client-version': '0.10.0',
						'x-session-id': 'session-2',
						'x-user-id': 'user-1',
						'x-environment': 'Development',
					})
					.send([
						{
							method: 'add-event',
							time: new Date().toISOString(),
							screenWidth: 400,
							screenHeight: 400,
							language: 'en_US',
							osName: 'MacIntel',
							platform: 'web',
							browserName: 'Chrome',
							userAgent:
								'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
							data: {
								featureIdentifier: 'my-feature',
								event: 'Impression',
								attributes: {
									blah: 'foo',
								},
							},
						} as AddEvent,
					])
					.expect(200);

				expect(batchRes2.body).toEqual({
					errors: [],
					features: [],
					sessionId: 'session-1',
				});

				const activeEvent = await prisma.activeEvent.findFirst({
					where: {
						id: activeEventRes.body.id,
					},
					select: {
						events: true,
					},
				});

				expect(activeEvent).toEqual({
					events: [
						{
							id: expect.any(Number),
							activeEventId: expect.any(Number),
							time: expect.any(Date),
							attributes: {
								blah: 'foo',
							},
							meta: {
								screenWidth: 400,
								screenHeight: 400,
								language: 'en_US',
								osName: 'MacIntel',
								platform: 'web',
								browserName: 'Chrome',
								userAgent:
									'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
							},
							createdAt: expect.any(Date),
							updatedAt: expect.any(Date),
							apiSessionId: expect.any(Number),
						},
					],
				});
			});

			test('should register feature interaction then add event', async () => {
				await prisma.apiSession.create({
					data: {
						userId: 'user-1',
						sessionId: 'session-1',
						appId: myApp.id,
						environment: 'Development',
					},
				});

				await request(app)
					.post('/1/batch')
					.set({
						'X-API-Key': myApp.apiKey,
						'X-API-AppId': myApp.appId,
						'x-client-version': '0.10.0',
						'x-session-id': 'session-1',
						'x-user-id': 'user-1',
						'x-environment': 'Development',
					})
					.send([
						{
							method: 'register-feature',
							time: new Date().toISOString(),
							screenWidth: 400,
							screenHeight: 400,
							language: 'en_US',
							osName: 'MacIntel',
							platform: 'web',
							browserName: 'Chrome',
							userAgent:
								'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
							data: {
								featureIdentifier: 'my-feature',
							},
						} as RegisterFeature,
						{
							method: 'register-feature-interaction',
							time: new Date().toISOString(),
							screenWidth: 400,
							screenHeight: 400,
							language: 'en_US',
							osName: 'MacIntel',
							platform: 'web',
							browserName: 'Chrome',
							userAgent:
								'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
							data: {
								featureIdentifier: 'my-feature',
								interactionIdentifier: 'click-me',
							},
						} as RegisterFeatureInteraction,
					])
					.expect(200);

				const feature = await prisma.feature.findFirst({
					where: {
						appId: myApp.id,
					},
					select: {
						id: true,
						featureInteractions: true,
					},
				});

				const interaction = feature?.featureInteractions[0];

				expect(interaction).toMatchObject({
					identifier: 'click-me',
				});

				const activeEventRes = await request(app)
					.put('/1/active-event')
					.send({
						appId: myApp.id,
						featureId: feature?.id,
						interactionId: interaction?.id,
						environment: 'Development',
						event: 'Click',
					})
					.set('Cookie', cookies)
					.expect(200);

				const batchRes2 = await request(app)
					.post('/1/batch')
					.set({
						'X-API-Key': myApp.apiKey,
						'X-API-AppId': myApp.appId,
						'x-client-version': '0.10.0',
						'x-session-id': 'session-1',
						'x-user-id': 'user-1',
						'x-environment': 'Development',
					})
					.send([
						{
							method: 'add-event',
							time: new Date().toISOString(),
							screenWidth: 400,
							screenHeight: 400,
							language: 'en_US',
							osName: 'MacIntel',
							platform: 'web',
							browserName: 'Chrome',
							userAgent:
								'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
							data: {
								featureIdentifier: 'my-feature',
								interactionIdentifier: 'click-me',
								event: 'Click',
								attributes: {
									blah: 'foo',
								},
							},
						} as AddEvent,
					])
					.expect(200);

				expect(batchRes2.body).toEqual({
					errors: [],
					features: [],
					sessionId: 'session-1',
				});

				const activeEvent = await prisma.activeEvent.findFirst({
					where: {
						id: activeEventRes.body.id,
					},
					select: {
						featureId: true,
						featureInteractionId: true,
						events: true,
					},
				});

				expect(activeEvent).toEqual({
					featureId: feature?.id,
					featureInteractionId: interaction?.id,
					events: [
						{
							id: expect.any(Number),
							activeEventId: expect.any(Number),
							time: expect.any(Date),
							attributes: {
								blah: 'foo',
							},
							meta: {
								screenWidth: 400,
								screenHeight: 400,
								language: 'en_US',
								osName: 'MacIntel',
								platform: 'web',
								browserName: 'Chrome',
								userAgent:
									'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
							},
							createdAt: expect.any(Date),
							updatedAt: expect.any(Date),
							apiSessionId: expect.any(Number),
						},
					],
				});
			});
		});

		describe('add-error', () => {
			test('should register feature then add error', async () => {
				await prisma.apiSession.create({
					data: {
						userId: 'user-1',
						sessionId: 'session-1',
						appId: myApp.id,
						environment: 'Development',
					},
				});

				const error = new Error('Something went wrong');

				await request(app)
					.post('/1/batch')
					.set({
						'X-API-Key': myApp.apiKey,
						'X-API-AppId': myApp.appId,
						'x-client-version': '0.10.0',
						'x-session-id': 'session-1',
						'x-user-id': 'user-1',
						'x-environment': 'Development',
					})
					.send([
						{
							method: 'register-feature',
							time: new Date().toISOString(),
							screenWidth: 400,
							screenHeight: 400,
							language: 'en_US',
							osName: 'MacIntel',
							platform: 'web',
							browserName: 'Chrome',
							userAgent:
								'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
							userId: '1',
							data: {
								featureIdentifier: 'my-feature',
							},
						} as RegisterFeature,
						{
							method: 'add-error',
							time: new Date().toISOString(),
							screenWidth: 400,
							screenHeight: 400,
							language: 'en_US',
							osName: 'MacIntel',
							platform: 'web',
							browserName: 'Chrome',
							userAgent:
								'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
							userId: '1',
							data: {
								featureIdentifier: 'my-feature',
								message: error.message,
								stack: error.stack,
							},
						} as FeatureError,
					])
					.expect(200);

				const dbError = await prisma.error.findFirst({
					where: {
						appId: myApp.id,
					},
				});

				expect(dbError).toEqual({
					appId: myApp.id,
					featureId: expect.any(Number),
					featureInteractionId: null,
					apiSessionId: expect.any(Number),
					id: expect.any(Number),
					info: null,
					message: 'Something went wrong',
					stack: expect.any(String),
					time: expect.any(Date),
					createdAt: expect.any(Date),
					updatedAt: expect.any(Date),
				});
			});
		});
	});
});
