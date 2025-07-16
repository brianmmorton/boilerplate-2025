import { cache, useModel, useModels } from './cache';
import { fetchWithAuth } from 'utils/fetchWithAuth';
import { refreshTokens } from 'utils/tokens/refreshTokens';
import { renderHook } from '@testing-library/react';
import { User as UserType } from 'types/User';
import { Product as ProductType } from 'types/Product';
import { ProductIdea as ProductIdeaType } from '@/types/ProductIdea';
import { Company as CompanyType } from 'types/Company';
import { PainPoint as PainPointType } from 'types/PainPoint';
import { Comment as CommentType } from 'types/Comment';
import { ProductResearch, ProductResearchStep } from '@/types';

// Mock dependencies
jest.mock('utils/fetchWithAuth');
jest.mock('utils/tokens/refreshTokens');

const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>;
const mockRefreshTokens = refreshTokens as jest.MockedFunction<typeof refreshTokens>;

describe('Cache', () => {
	beforeEach(() => {
		// Clear the cache before each test
		cache.clear();

		// Reset mocks
		mockFetchWithAuth.mockReset();
		mockRefreshTokens.mockReset();
		mockRefreshTokens.mockResolvedValue(true);

		// Mock window.location.replace
		Object.defineProperty(window, 'location', {
			value: { replace: jest.fn() },
			writable: true,
		});
	});

	describe('set and get', () => {
		it('should set and get a single entity', () => {
			// Arrange
			const user: UserType = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
			};

			// Act
			cache.set('user', user);
			const retrievedUser = cache.get('user', '1');

			// Assert
			expect(retrievedUser).toEqual(user);
		});

		it('should set and get multiple entities', () => {
			// Arrange
			const users: UserType[] = [
				{ id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
				{ id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
			];

			// Act
			cache.set('user', users);
			const user1 = cache.get('user', '1');
			const user2 = cache.get('user', '2');

			// Assert
			expect(user1).toEqual(users[0]);
			expect(user2).toEqual(users[1]);
		});

		it('should handle nested entities', () => {
			const idea: ProductIdeaType = {
				id: 1,
				title: 'Test Idea',
				description: 'Test description',
				rank: 1,
				sources: [],
				supportCount: 0,
				sentimentScore: 0.5,
				feasibility: 'High',
				valueProp: 'Test value prop',
				painPoints: [],
				status: 'ACTIVE',
				createdAt: '2023-01-01',
				updatedAt: '2023-01-01',
				comments: [],
				painPointId: 1,
			};
			const painPoint: PainPointType = {
				id: 1,
				title: 'Test Pain Point',
				description: 'Test description',
				summary: 'Test summary',
				severity: 80,
				frequency: 75,
				ideas: [idea],
				sources: [],
				status: 'ACTIVE',
				createdAt: '2023-01-01',
				updatedAt: '2023-01-01',
				comments: [],
				features: [],
			};
			const product: ProductType = {
				id: 1,
				name: 'Product 1',
				description: 'This is a great product',
				businessType: 'Education',
				researches: [],
				companyId: 1,
				painPoints: [painPoint],
			};

			cache.set('product', product);
			const retrievedProduct = cache.get('product', '1');
			const retrievedIdea = cache.get('idea', '1');

			expect(retrievedProduct).toEqual(expect.objectContaining(product));
			expect(retrievedIdea).toEqual(expect.objectContaining(idea));
		});

		it('should not add duplicate entities during initial set', () => {
			const user: UserType = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
			};
			const company: CompanyType = {
				id: 1,
				name: 'Company 1',
				integrations: [],
				products: [
					{
						id: 1,
						name: 'Product 1',
						description: 'This is a great product',
						businessType: 'Education',
						researches: [],
						companyId: 1,
					},
					{
						id: 1,
						name: 'Product 1',
						description: 'This is a great product',
						businessType: 'Education',
						researches: [],
						companyId: 1,
					},
				],
				memberships: [],
				subscriptionStatus: 'ACTIVE',
				subscriptionTier: 'STANDARD',
				trialEndDate: new Date(),
			};

			cache.set('user', user);
			cache.set('company', company);

			expect(cache.get('product', '1')).toEqual(
				expect.objectContaining({ id: 1, name: 'Product 1' }),
			);
			expect(cache.get('company', '1')).toEqual(
				expect.objectContaining({
					id: 1,
					name: 'Company 1',
					products: [expect.objectContaining({ id: 1, name: 'Product 1' })],
				}),
			);
		});

		it('should not add duplicate entities during subsequent set', () => {
			const user: UserType = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
			};
			const company: CompanyType = {
				id: 1,
				name: 'Company 1',
				integrations: [],
				products: [
					{
						id: 1,
						name: 'Product 1',
						description: 'This is a great product',
						businessType: 'Education',
						researches: [],
						companyId: 1,
					},
				],
				memberships: [],
				subscriptionStatus: 'ACTIVE',
				subscriptionTier: 'STANDARD',
				trialEndDate: new Date(),
			};

			cache.set('user', user);
			cache.set('company', company);
			cache.set('company', company);

			expect(cache.get('product', '1')).toEqual(
				expect.objectContaining({ id: 1, name: 'Product 1' }),
			);
			expect(cache.get('company', '1')).toEqual(
				expect.objectContaining({
					id: 1,
					name: 'Company 1',
					products: [expect.objectContaining({ id: 1, name: 'Product 1' })],
				}),
			);
		});

		it('should set nested entities', () => {
			const research: ProductResearch = {
				id: 1,
				productId: 1,
				researchSteps: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const researchStep: ProductResearchStep = {
				id: 1,
				researchId: 1,
				summary: 'This is a great research step',
				name: 'Research Step 1',
				status: 'PENDING',
				icon: 'icon',
				failureReason: 'This is a great research step',
				group: 'Analysis',
				order: 1,
				weight: 1,
				isParallel: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			cache.set('research', {
				...research,
				researchSteps: [researchStep],
			});

			const retrievedResearch = cache.get('research', '1');
			const retrievedResearchStep = cache.get('researchStep', '1');

			expect(retrievedResearch).toEqual(
				expect.objectContaining({
					id: 1,
					productId: 1,
					product: '1',
					researchSteps: [
						expect.objectContaining({
							id: 1,
							researchId: 1,
							name: 'Research Step 1',
						}),
					],
				}),
			);
			expect(retrievedResearchStep).toEqual(
				expect.objectContaining({
					id: 1,
					researchId: 1,
					name: 'Research Step 1',
					summary: 'This is a great research step',
					status: 'PENDING',
					icon: 'icon',
					failureReason: 'This is a great research step',
					createdAt: expect.any(Date),
					updatedAt: expect.any(Date),
				}),
			);
		});

		it('should build relationships with separate set calls', () => {
			const research: ProductResearch = {
				id: 1,
				productId: 1,
				researchSteps: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const researchStep: ProductResearchStep = {
				id: 1,
				researchId: 1,
				summary: 'This is a great research step',
				name: 'Research Step 1',
				status: 'PENDING',
				icon: 'icon',
				failureReason: 'This is a great research step',
				group: 'Analysis',
				order: 1,
				weight: 1,
				isParallel: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			cache.set('research', research);
			cache.set('researchStep', researchStep);

			const retrievedResearch = cache.get('research', '1');
			const retrievedResearchStep = cache.get('researchStep', '1');

			expect(retrievedResearch).toEqual(
				expect.objectContaining({
					id: 1,
					productId: 1,
					product: '1',
					researchSteps: [
						expect.objectContaining({
							id: 1,
							researchId: 1,
							name: 'Research Step 1',
						}),
					],
				}),
			);
			expect(retrievedResearchStep).toEqual(
				expect.objectContaining({
					id: 1,
					researchId: 1,
					name: 'Research Step 1',
					summary: 'This is a great research step',
					status: 'PENDING',
					icon: 'icon',
					failureReason: 'This is a great research step',
					createdAt: expect.any(Date),
					updatedAt: expect.any(Date),
				}),
			);
		});

		it('should add multiple researches to a product under the correct key (pluralization)', () => {
			const company: CompanyType = {
				id: 1,
				name: 'Company 1',
				integrations: [],
				products: [],
				memberships: [],
				subscriptionStatus: 'ACTIVE',
				subscriptionTier: 'STANDARD',
				trialEndDate: new Date(),
			};

			cache.set('company', company);

			const product: ProductType = {
				id: 1,
				name: 'Product 1',
				description: 'This is a great product',
				businessType: 'Education',
				researches: [],
				companyId: 1,
			};

			cache.set('product', product);

			const research: ProductResearch = {
				id: 1,
				productId: 1,
				researchSteps: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			cache.set('research', research);

			const researchStep: ProductResearchStep = {
				id: 1,
				researchId: 1,
				summary: 'This is a great research step',
				name: 'Research Step 1',
				status: 'PENDING',
				icon: 'icon',
				failureReason: 'This is a great research step',
				group: 'Analysis',
				order: 1,
				weight: 1,
				isParallel: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			cache.set('researchStep', researchStep);

			const retrievedResearch = cache.get('research', '1');
			const retrievedResearchStep = cache.get('researchStep', '1');

			expect(retrievedResearch).toEqual(
				expect.objectContaining({
					id: 1,
					productId: 1,
					product: '1',
					researchSteps: [
						expect.objectContaining({
							id: 1,
							researchId: 1,
							name: 'Research Step 1',
						}),
					],
				}),
			);
			expect(retrievedResearchStep).toEqual(
				expect.objectContaining({
					id: 1,
					researchId: 1,
					name: 'Research Step 1',
					summary: 'This is a great research step',
					status: 'PENDING',
					icon: 'icon',
					failureReason: 'This is a great research step',
					createdAt: expect.any(Date),
					updatedAt: expect.any(Date),
				}),
			);

			cache.set('research', {
				...research,
				id: 2,
			});

			const retrievedProduct = cache.get('product', '1');
			expect(retrievedProduct?.researches).toEqual([
				expect.objectContaining({ id: 1 }),
				expect.objectContaining({ id: 2 }),
			]);
		});
	});

	describe('remove', () => {
		it('should remove an entity from the cache', () => {
			// Arrange
			const user: UserType = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
			};
			cache.set('user', user);

			// Act
			cache.remove('user', '1');
			const retrievedUser = cache.get('user', '1');

			// Assert
			expect(retrievedUser).toBeUndefined();
		});

		it('should not throw when removing a non-existent entity', () => {
			// Act & Assert
			expect(() => cache.remove('user', 'non-existent')).not.toThrow();
		});
	});

	describe('fetchData', () => {
		it('should fetch and cache data', async () => {
			// Arrange
			const user: UserType = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
			};
			const mockResponse = new Response(JSON.stringify(user), { status: 200 });
			mockFetchWithAuth.mockResolvedValue(mockResponse);

			// Act
			const response = await cache.fetchData('user', { url: '/api/users/1' });
			const data = await response.json();
			const cachedUser = cache.get('user', '1');

			// Assert
			expect(data).toEqual(user);
			expect(cachedUser).toEqual(user);
			expect(mockFetchWithAuth).toHaveBeenCalledWith('/api/users/1', expect.any(Object));
		});

		it('should refresh tokens when needed', async () => {
			cache.httpCache.setState({
				lastTokenRefresh: new Date(Date.now() - 1000 * 60 * 60 * 24),
			});
			const user: UserType = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
			};
			const mockResponse = new Response(JSON.stringify(user), { status: 200 });
			mockFetchWithAuth.mockResolvedValue(mockResponse);

			await cache.fetchData('user', { url: '/api/users/1' });

			expect(mockRefreshTokens).toHaveBeenCalled();
		});

		it('should retry on 401 unauthorized', async () => {
			const user: UserType = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
			};
			cache.httpCache.setState({
				lastTokenRefresh: null,
			});
			const unauthorizedResponse = new Response(
				JSON.stringify({ code: 'unauthorized', message: 'Unauthorized' }),
				{ status: 401 },
			);
			const successResponse = new Response(JSON.stringify(user), { status: 200 });

			// First call returns 401, second call succeeds
			mockFetchWithAuth.mockResolvedValueOnce(unauthorizedResponse);
			mockFetchWithAuth.mockResolvedValueOnce(successResponse);

			await cache.fetchData('user', { url: '/api/users/1' });

			const cachedUser = cache.get('user', '1');

			expect(cachedUser).toEqual(user);
			expect(mockRefreshTokens).toHaveBeenCalledTimes(1);
			expect(mockFetchWithAuth).toHaveBeenCalledTimes(2);
		});

		it('should apply merge function to response data', async () => {
			const apiResponse: UserType = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
			};
			const expectedMerged = {
				id: 1,
				name: 'John Doe',
			};

			const mockResponse = new Response(JSON.stringify(apiResponse), { status: 200 });
			mockFetchWithAuth.mockResolvedValue(mockResponse);

			const mergeFn = (data: any) => ({
				id: data.id,
				name: `${data.firstName} ${data.lastName}`,
			});

			await cache.fetchData('user', {
				url: '/api/users/1',
				merge: mergeFn,
			});

			const cachedUser = cache.get('user', '1');

			expect(cachedUser).toEqual(expectedMerged);
		});
	});

	describe('create', () => {
		it('should create and cache a new entity', async () => {
			const newUser: UserType = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
			};

			const mockResponse = new Response(JSON.stringify(newUser), { status: 201 });
			mockFetchWithAuth.mockResolvedValue(mockResponse);

			// Act
			const [result, error, response] = await cache.create('user', {
				url: '/api/users',
				data: newUser,
			});

			// Assert
			expect(result).toEqual(newUser);
			expect(error).toBeNull();
			expect(response.status).toBe(201);

			const cachedUser = cache.get('user', '1');
			expect(cachedUser).toEqual(newUser);
		});

		it('should handle API errors', async () => {
			// Arrange
			const newUser: UserType = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
			};
			const apiError = { code: 'validation_error', message: 'Email is required' };

			const mockResponse = new Response(JSON.stringify(apiError), { status: 400 });
			mockFetchWithAuth.mockResolvedValue(mockResponse);

			// Act
			const [result, error, response] = await cache.create('user', {
				url: '/api/users',
				data: newUser,
			});

			// Assert
			expect(result).toBeNull();
			expect(error).toBeInstanceOf(Error);
			expect(error?.message).toBe('Email is required');
			expect(response.status).toBe(400);
		});

		it('should apply merge function to response data', async () => {
			// Arrange
			const newUser: UserType = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
			};
			const apiResponse: UserType = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
			};
			const expectedMerged = {
				id: 1,
				name: 'John Doe',
			};

			const mockResponse = new Response(JSON.stringify(apiResponse), { status: 201 });
			mockFetchWithAuth.mockResolvedValue(mockResponse);

			const mergeFn = (data: any) => ({
				id: data.id,
				name: `${data.firstName} ${data.lastName}`,
			});

			// Act
			const [result] = await cache.create('user', {
				url: '/api/users',
				data: newUser,
				merge: mergeFn,
			});

			// Assert
			expect(result).toEqual(expectedMerged);

			const cachedUser = cache.get('user', '1');
			expect(cachedUser).toEqual(expectedMerged);
		});

		it('should create a company then a product, and associate the product with the company when using companyId', async () => {
			const company: CompanyType = {
				id: 1,
				name: 'Company 1',
				integrations: [],
				products: [],
				memberships: [],
				subscriptionStatus: 'ACTIVE',
				subscriptionTier: 'STANDARD',
				trialEndDate: new Date(),
			};
			const product: ProductType = {
				id: 1,
				name: 'Product 1',
				description: 'This is a great product',
				businessType: 'Education',
				researches: [],
				companyId: 1,
			};

			const mockResponseForCompany = new Response(JSON.stringify(company), { status: 201 });
			mockFetchWithAuth.mockResolvedValue(mockResponseForCompany);

			const [createdCompany, companyError, companyResponse] = await cache.create('company', {
				url: '/api/companies',
				data: company,
			});

			const mockResponseForProduct = new Response(JSON.stringify(product), { status: 201 });
			mockFetchWithAuth.mockResolvedValue(mockResponseForProduct);

			await cache.create('product', {
				url: '/api/products',
				data: product,
			});

			expect(createdCompany).toEqual({
				id: 1,
				name: 'Company 1',
				products: [],
				memberships: [],
				subscriptionStatus: 'ACTIVE',
				subscriptionTier: 'STANDARD',
				trialEndDate: expect.any(String),
			});
			expect(companyError).toBeNull();
			expect(companyResponse.status).toBe(201);

			const cachedProduct = cache.get('product', '1');
			expect(cachedProduct).toEqual(
				expect.objectContaining({
					id: 1,
					name: 'Product 1',
					description: 'This is a great product',
					businessType: 'Education',
					researches: [],
					companyId: 1,
				}),
			);
			expect(cachedProduct.company).toEqual(
				expect.objectContaining({
					id: 1,
					name: 'Company 1',
					memberships: [],
				}),
			);
			const cachedCompany = cache.get('company', '1');
			expect(cachedCompany).toEqual(
				expect.objectContaining({
					id: 1,
					name: 'Company 1',
					products: [expect.objectContaining({ id: 1 })],
					memberships: [],
				}),
			);
		});

		it('should create a company then a product, and associate the product with the company when using company', async () => {
			const trialEndDate = new Date();
			trialEndDate.setDate(trialEndDate.getDate() + 14);
			const companyOne: CompanyType = {
				id: 1,
				name: 'Company 1',
				integrations: [],
				products: [],
				memberships: [],
				subscriptionStatus: 'ACTIVE',
				subscriptionTier: 'STANDARD',
				trialEndDate: trialEndDate,
			};
			const productOne = {
				id: 1,
				name: 'Product 1',
				description: 'This is a great product',
				businessType: 'Education',
				researches: [],
				company: {
					id: 1,
				},
			};

			const mockResponseForCompany = new Response(JSON.stringify(companyOne), { status: 201 });
			mockFetchWithAuth.mockResolvedValue(mockResponseForCompany);

			const [createdCompany, companyError, companyResponse] = await cache.create('company', {
				url: '/api/companies',
				data: companyOne,
			});

			const mockResponseForProduct = new Response(JSON.stringify(productOne), { status: 201 });
			mockFetchWithAuth.mockResolvedValue(mockResponseForProduct);

			await cache.create('product', {
				url: '/api/products',
				data: productOne,
			});

			expect(createdCompany).toEqual({
				id: 1,
				name: 'Company 1',
				products: [],
				memberships: [],
				subscriptionStatus: 'ACTIVE',
				subscriptionTier: 'STANDARD',
				trialEndDate: trialEndDate.toISOString(),
			});
			expect(companyError).toBeNull();
			expect(companyResponse.status).toBe(201);

			const cachedProduct = cache.get('product', '1');
			expect(cachedProduct).toEqual(
				expect.objectContaining({
					id: 1,
					name: 'Product 1',
					description: 'This is a great product',
					businessType: 'Education',
					researches: [],
				}),
			);

			expect(cachedProduct.company).toEqual(
				expect.objectContaining({
					id: 1,
					name: 'Company 1',
					memberships: [],
				}),
			);

			const cachedCompany = cache.get('company', '1');
			expect(cachedCompany).toEqual(
				expect.objectContaining({
					id: 1,
					name: 'Company 1',
					memberships: [],
				}),
			);
			expect(cachedCompany.products).toEqual([
				expect.objectContaining({
					id: 1,
					name: 'Product 1',
					description: 'This is a great product',
					businessType: 'Education',
					researches: [],
				}),
			]);

			const productTwo = {
				id: 2,
				name: 'Product 2',
				description: 'This is another great product',
				businessType: 'Healthcare',
				researches: [],
				company: {
					id: 1,
				},
			};

			mockFetchWithAuth.mockResolvedValue(
				new Response(JSON.stringify(productTwo), {
					status: 201,
				}),
			);

			await cache.create('product', {
				url: '/api/products',
				data: productTwo,
			});

			const cachedCompanyTwo = cache.get('company', '1');

			expect(cachedCompanyTwo.products.length).toBe(2);
			expect(cachedCompanyTwo.products[0].id).toBe(1);
			expect(cachedCompanyTwo.products[1].id).toBe(2);
		});

		it('should create a comment, then associate it with a pain point', async () => {
			const painPoint: PainPointType = {
				id: 1,
				title: 'Test Pain Point',
				description: 'Test description',
				summary: 'Test summary',
				severity: 80,
				frequency: 75,
				ideas: [],
				sources: [],
				status: 'ACTIVE',
				createdAt: '2023-01-01',
				updatedAt: '2023-01-01',
				comments: [],
				features: [],
			};

			cache.set('painPoint', painPoint);

			const comment: CommentType = {
				id: 1,
				content: 'Test comment',
				type: 'PAIN_POINT',
				painPointId: 1,
				productIdeaId: null,
				createdAt: '2023-01-01',
				updatedAt: '2023-01-01',
				authorId: 1,
				author: {
					id: 1,
					firstName: 'John',
					lastName: 'Doe',
					email: 'john@example.com',
				},
			};

			const mockResponseForComment = new Response(
				JSON.stringify({
					...comment,
					painPoint: {
						id: 1,
					},
				}),
				{ status: 201 },
			);
			mockFetchWithAuth.mockResolvedValue(mockResponseForComment);

			const [createdComment, commentError, commentResponse] = await cache.create('comment', {
				url: '/api/comments',
				data: comment,
			});

			expect(createdComment).toEqual({
				id: 1,
				content: 'Test comment',
				type: 'PAIN_POINT',
				painPointId: 1,
				productIdeaId: null,
				createdAt: '2023-01-01',
				updatedAt: '2023-01-01',
				authorId: 1,
				author: {
					id: 1,
					firstName: 'John',
					lastName: 'Doe',
					email: 'john@example.com',
				},
				painPoint: expect.objectContaining({
					id: 1,
				}),
			});
			expect(commentError).toBeNull();
			expect(commentResponse.status).toBe(201);

			const cachedPainPoint = cache.get('painPoint', '1');
			expect(cachedPainPoint.comments).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						id: 1,
						content: 'Test comment',
					}),
				]),
			);

			const cachedComment = cache.get('comment', '1');
			expect(cachedComment).toEqual(
				expect.objectContaining({
					id: 1,
					content: 'Test comment',
					type: 'PAIN_POINT',
					painPointId: 1,
					productIdeaId: null,
					createdAt: '2023-01-01',
					updatedAt: '2023-01-01',
					authorId: 1,
					author: {
						id: 1,
						firstName: 'John',
						lastName: 'Doe',
						email: 'john@example.com',
					},
					painPoint: expect.objectContaining({
						id: 1,
					}),
				}),
			);
		});
	});

	describe('clear', () => {
		it('should clear all entities from the cache', () => {
			// Arrange
			const user: UserType = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
			};
			const product: ProductType = {
				id: 1,
				name: 'Product 1',
				description: 'This is a great product',
				businessType: 'Education',
				researches: [],
				companyId: 1,
			};
			cache.set('user', user);
			cache.set('product', product);

			// Act
			cache.clear();

			// Assert
			expect(cache.get('user', '1')).toBeUndefined();
			expect(cache.get('product', '1')).toBeUndefined();
		});
	});
});

// Mock React hooks tests
describe('React hooks', () => {
	beforeEach(() => {
		cache.clear();
	});

	describe('useModel', () => {
		it('should return selected data from a model', () => {
			// Arrange
			const user: UserType = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
			};
			cache.set('user', user);

			// Act
			const { result } = renderHook(() => useModel('user', '1', (user) => user?.firstName));

			// Assert
			expect(result.current).toBe('John');
		});

		it('should return null when id is not provided', () => {
			// Arrange
			const user: UserType = {
				id: 1,
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
			};
			cache.set('user', user);

			// Act
			const { result } = renderHook(() =>
				useModel('user', null, (user) => user?.firstName ?? 'default'),
			);

			// Assert
			expect(result.current).toBe('default');
		});
	});

	describe('useModels', () => {
		it('should return selected data from multiple models', () => {
			// Arrange
			const users: UserType[] = [
				{ id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
				{ id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
			];

			cache.set('user', users);

			// Act
			const { result } = renderHook(() =>
				useModels('users', (users) => users.map((user) => `${user.firstName} ${user.lastName}`)),
			);

			// Assert
			expect(result.current).toEqual(['John Doe', 'Jane Smith']);
		});

		it('should return empty array when no entities exist', () => {
			// Act
			const { result } = renderHook(() =>
				useModels('users', (users) => users.map((user) => `${user.firstName} ${user.lastName}`)),
			);

			// Assert
			expect(result.current).toEqual([]);
		});
	});
});
