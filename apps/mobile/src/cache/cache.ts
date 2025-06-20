import { schema, normalize, denormalize } from 'normalizr';
import { User as UserType } from '../types/User';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { differenceInMinutes } from 'date-fns';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { refreshTokens } from '../utils/refreshTokens';

/**
 * Default strategy for merging entities when normalizing data
 * @param {object} entityA - The existing entity
 * @param {object} entityB - The new entity to merge
 * @returns {object} The merged entity
 */
const defaultMergeStrategy = (entityA: object, entityB: object) => {
	return {
		...entityA,
		...entityB,
	};
};

/**
 * Utility function to deduplicate arrays of objects by their id property
 * @param {any[]} arr - Array to deduplicate
 * @returns {any[]} Deduplicated array
 */
const deduplicateById = <T extends { id: any }>(arr: T[]): T[] => {
	if (!Array.isArray(arr) || arr.length === 0) {
		return arr;
	}

	const seen = new Set();
	return arr.filter((item) => {
		if (!item || typeof item !== 'object' || item.id === undefined) {
			return true; // Keep non-object items or items without id
		}

		const id = String(item.id);
		if (seen.has(id)) {
			return false; // Remove duplicate
		}

		seen.add(id);
		return true; // Keep first occurrence
	});
};

/**
 * Recursively deduplicate arrays in an object or array structure
 * @param {any} data - Data to process
 * @returns {any} Data with deduplicated arrays
 */
const recursivelyDeduplicateArrays = (data: any): any => {
	if (Array.isArray(data)) {
		// If it's an array of objects with id, deduplicate it
		const deduplicated = deduplicateById(data);
		// Recursively process each item in the array
		return deduplicated.map((item) => recursivelyDeduplicateArrays(item));
	}

	if (data && typeof data === 'object' && data.constructor === Object) {
		// If it's a plain object, recursively process its properties
		const result = { ...data };
		for (const key in result) {
			if (result.hasOwnProperty(key)) {
				result[key] = recursivelyDeduplicateArrays(result[key]);
			}
		}
		return result;
	}

	// For primitives, dates, etc., return as-is
	return data;
};

/**
 * Schema definition for User entities
 */
export const User = new schema.Entity<UserType>(
	'users',
	{},
	{
		mergeStrategy: defaultMergeStrategy,
	},
);
/**
 * User.define({
 *   ...relationships,
 * })
 */

/**
 * Utility type to extract the entity type from a schema
 */
type EntityType<S> = S extends schema.Entity<infer T> ? T : never;

/**
 * Structure of the normalized data cache
 */
export type GenericCache = {
	users: {
		[k: string]: EntityType<typeof User> | undefined;
	};
};

/**
 * Mapping of model names to their corresponding schema definitions
 */
const SingularModelNameToSchema = {
	user: User,
} as const;

const SingularToPluralModelName = {
	user: 'users',
} as const;

const PluralModelNameToSchema = {
	users: User,
} as const;

const PluralToSingularModelName: Record<
	keyof GenericCache,
	keyof typeof SingularToPluralModelName
> = {
	users: 'user',
};

/**
 * Valid model names that can be used with the cache
 */
export type SingularModelName = keyof typeof SingularToPluralModelName;
export type SingularToPluralModelNameMap = typeof SingularToPluralModelName;

/**
 * Zustand store for the normalized entity cache
 */
const _cache = create<GenericCache & { _update: (nextState: GenericCache) => void }>(
	(setState) => ({
		users: {},
		_update: (nextState: GenericCache) => {
			setState(nextState);
		},
	}),
);

/**
 * Zustand store for HTTP request caching and token refresh tracking
 */
const _httpCache = create<{
	requests: Record<string, Record<string, Promise<Response>>>;
	lastTokenRefresh: Date | null;
	setRequestCache: (nextState: Record<string, Record<string, Promise<Response>>>) => void;
	setLastTokenRefresh: (token: Date | null) => void;
}>((setState) => ({
	requests: {},
	lastTokenRefresh: null,
	setRequestCache: (requests: Record<string, Record<string, Promise<Response>>>) =>
		setState({ requests }),
	setLastTokenRefresh: (lastTokenRefresh: Date | null) => setState({ lastTokenRefresh }),
}));

/**
 * Structure of API error responses
 */
type ApiError = {
	code: string;
	message: string;
};

/**
 * Type guard to check if a response is an API error
 * @param {any} data - The data to check
 * @returns {boolean} True if the data is an API error
 */
const isApiError = (data: any): data is ApiError => {
	return typeof data === 'object' && data !== null && 'code' in data && 'message' in data;
};

/**
 * Bidirectional relationship definitions
 * Maps entity types to their relationships and how to maintain them automatically
 */
const RELATIONSHIP_MAP: {
	[key in SingularModelName]: {
		[key in SingularModelName]?: {
			foreignKey?: string;
			inverseField?: string;
			targetEntity?: string;
			createReference?: string;
		};
	};
} = {
	user: {},
} as const;

/**
 * Automatically maintains bidirectional relationships when entities are set in the cache
 * @param {object} cache - Current cache state
 * @param {string} entityType - Type of entity being set
 * @param {object} entity - The entity data
 * @returns {object} Updated cache state
 */
const maintainBidirectionalRelationships = (
	cache: GenericCache,
	entityType: SingularModelName,
	entity: any,
): GenericCache => {
	const relationships = RELATIONSHIP_MAP[entityType as keyof typeof RELATIONSHIP_MAP];
	if (!relationships) {
		return cache;
	}

	const updatedCache = { ...cache };

	// Process each relationship for this entity type
	Object.entries(relationships).forEach(([relationshipName, config]) => {
		const foreignKeyId = config.foreignKey ? config.foreignKey : `${relationshipName}Id`;
		const inverseField = config.inverseField ? config.inverseField : `${entityType}s`;
		const targetEntityKey = config.targetEntity ? config.targetEntity : relationshipName;
		const createReference = config.createReference ? config.createReference : relationshipName;
		const foreignKeyValue = entity[foreignKeyId] ?? entity[relationshipName];

		if (foreignKeyValue) {
			const targetPluralType = SingularToPluralModelName[
				targetEntityKey as SingularModelName
			] as keyof GenericCache;

			// Ensure the target entity type exists in cache
			if (!updatedCache[targetPluralType]) {
				(updatedCache as any)[targetPluralType] = {};
			}

			// Ensure foreign key value is treated as string to match normalizr's behavior
			const foreignKeyString = String(foreignKeyValue);
			const targetEntity = (updatedCache as any)[targetPluralType][foreignKeyString];

			if (targetEntity) {
				const targetEntityRelationships = new Set(targetEntity[inverseField] ?? []);

				// Add this entity's ID to the target's relationship array if not already present
				const entityId = Number(entity.id);
				// Convert all existing IDs to numbers for consistent comparison and always store as numbers
				if (!targetEntityRelationships.has(entityId)) {
					targetEntityRelationships.add(entityId);
				}

				targetEntity[inverseField] = Array.from(targetEntityRelationships);
			}

			// Create reference on the source entity if specified
			if (createReference && !entity[createReference]) {
				const entityPluralType = SingularToPluralModelName[entityType] as keyof GenericCache;
				const entityId = String(entity.id);

				if (updatedCache[entityPluralType][entityId]) {
					(updatedCache[entityPluralType][entityId] as any)[createReference] = foreignKeyString;
				}
			}
		}
	});

	return updatedCache;
};

/**
 * Cache class for managing normalized entity data and HTTP requests
 */
class Cache {
	cache = _cache;
	httpCache = _httpCache;

	isEntity = (key: string): key is keyof typeof SingularModelNameToSchema => {
		const { _update, ...state } = this.cache.getState();
		return key in state;
	};

	/**
	 * Store entity data in the normalized cache
	 * @param {ModelName} model - The type of model to store
	 * @param {object|object[]|null} data - The data to normalize and store
	 */
	set<Model extends SingularModelName>(
		model: Model,
		data:
			| GenericCache[(typeof SingularToPluralModelName)[Model]][string]
			| GenericCache[(typeof SingularToPluralModelName)[Model]][string][]
			| null,
	) {
		if (Array.isArray(data)) {
			for (const subModel of data) {
				this.set(model, subModel);
			}
			return;
		}

		// Deduplicate arrays before normalization
		const deduplicatedData = recursivelyDeduplicateArrays(data);

		const normalized = normalize<
			EntityType<GenericCache[(typeof SingularToPluralModelName)[Model]][string]>
		>(deduplicatedData, SingularModelNameToSchema[model]);

		const nextEntities = normalized['entities'];

		const { _update, ...currentCache } = this.cache.getState();

		const modelNames = Object.keys(nextEntities) as (keyof GenericCache)[];

		modelNames.forEach((modelName) => {
			if (!(modelName in currentCache)) {
				throw new Error(
					`Model ${modelName} not found in cache. Ensure its schema is defined and defaulted in the cache.`,
				);
			}

			const allIds = new Set<string>([
				...Object.keys(currentCache[modelName]),
				...Object.keys(nextEntities[modelName] ?? {}),
			]);
			const nextEntitiesIdRecord = nextEntities[modelName] ?? {};

			allIds.forEach((idKey) => {
				const idKeyString = String(idKey);
				if (
					idKeyString === 'undefined' ||
					idKeyString === 'null' ||
					!nextEntitiesIdRecord[idKeyString]
				) {
					return;
				} else if (idKeyString in currentCache[modelName]) {
					const nextEntity = nextEntitiesIdRecord[idKeyString];

					for (const key in nextEntity) {
						if (this.isEntity(key)) {
							if (Array.isArray(nextEntity[key])) {
								const set = new Set([
									// @ts-expect-error - TODO: fix this
									...(currentCache[modelName][idKeyString]?.[key] ?? []),
									...nextEntity[key],
								]);

								// @ts-expect-error - TODO: fix this
								nextEntity[key] = Array.from(set);
							}
						}
					}

					// @ts-expect-error - TODO: fix this
					currentCache[modelName][idKeyString] = {
						...currentCache[modelName][idKeyString],
						...nextEntity,
					};
				} else {
					const nextEntity = nextEntitiesIdRecord[idKeyString];
					// @ts-expect-error - TODO: fix this
					currentCache[modelName][idKeyString] = nextEntity;
				}
			});
		});

		// Maintain bidirectional relationships for each entity that was processed
		modelNames.forEach((modelName) => {
			const nextEntitiesIdRecord = nextEntities[modelName] ?? {};
			const singularModelName = PluralToSingularModelName[modelName];

			Object.keys(nextEntitiesIdRecord).forEach((idKey) => {
				const idKeyString = String(idKey);
				if (
					idKeyString !== 'undefined' &&
					idKeyString !== 'null' &&
					nextEntitiesIdRecord[idKeyString]
				) {
					const entity = nextEntitiesIdRecord[idKeyString];
					Object.assign(
						currentCache,
						maintainBidirectionalRelationships(currentCache, singularModelName, entity),
					);
				}
			});
		});

		_update(currentCache);
	}

	/**
	 * Remove an entity from the cache
	 * @param {ModelName} model - The type of model to remove
	 * @param {string} id - The ID of the entity to remove
	 */
	remove<Model extends SingularModelName>(model: Model, id: string) {
		const { _update, ...nextCache } = this.cache.getState();

		const modelName = SingularToPluralModelName[model];

		if (!nextCache[modelName][id]) {
			return;
		}

		delete nextCache[modelName][id];

		_update(nextCache);
	}

	/**
	 * Retrieve a denormalized entity from the cache
	 * @param {ModelName} model - The type of model to retrieve
	 * @param {string} id - The ID of the entity to retrieve
	 * @returns {object|undefined} The denormalized entity
	 */
	get<Model extends SingularModelName>(model: Model, id: string) {
		const cache = this.cache.getState();
		const modelName = SingularToPluralModelName[model];

		return denormalize(cache[modelName][id], SingularModelNameToSchema[model], cache);
	}

	/**
	 * Refresh authentication tokens if needed
	 * @private
	 * @returns {Promise<void>}
	 */
	private async refreshTokens() {
		const { lastTokenRefresh, setLastTokenRefresh } = this.httpCache.getState();

		if (!lastTokenRefresh || differenceInMinutes(new Date(), lastTokenRefresh) > 30) {
			setLastTokenRefresh(new Date());
			const success = await refreshTokens();

			if (!success) {
				window.location.replace('/login');
			}
		}
	}

	/**
	 * Fetch data from the API and store it in the cache
	 * Example:
	 * const response = await cache.fetchData('user', {
	 *   url: '/1/users',
	 * });
	 * @param {ModelName} model - The type of model to fetch
	 * @param {object} options - Fetch options
	 * @param {string} options.url - The URL to fetch from
	 * @param {Function} [options.merge] - Optional function to transform the response data
	 * @param {AbortSignal} [options.signal] - Optional AbortSignal for cancellation
	 * @param {boolean} [options.didRetry] - Whether this is a retry attempt after token refresh
	 * @returns {Promise<Response>} The fetch response
	 */
	async fetchData<Model extends SingularModelName>(
		model: Model,
		{
			url,
			merge,
			signal,
			didRetry = false,
			force = false,
		}: {
			url: string;
			merge?: (data: any) => any;
			signal?: RequestInit['signal'];
			didRetry?: boolean;
			force?: boolean;
		},
	): Promise<Response> {
		const { requests, setRequestCache } = this.httpCache.getState();

		if (!requests[model]) {
			requests[model] = {};
		}

		await this.refreshTokens();

		// @ts-expect-error
		if (requests[model][url] && !force) {
			return (await requests[model][url]).clone();
		}

		requests[model][url] = fetchWithAuth(`${url}`, {
			method: 'GET',
			signal,
		});

		setRequestCache(requests);

		const response = await (await requests[model][url]).clone();

		if (response.status === 401 && !didRetry) {
			await this.refreshTokens();

			delete requests[model][url];

			return this.fetchData(model, {
				url,
				merge,
				signal,
				didRetry: true,
				force,
			});
		}

		const data = await response.json();
		const formatted = merge ? merge(data) : data;

		if (response.ok && formatted) {
			this.set(model, formatted);
		}

		return (await requests[model][url]).clone();
	}

	/**
	 * Create a new entity via API and store it in the cache
	 * Example:
	 * const [user, error, response] = await cache.create('user', {
	 *   url: '/1/users',
	 *   data: { name: 'John Doe' },
	 * });
	 * @param {ModelName} model - The type of model to create
	 * @param {object} options - Creation options
	 * @param {string} options.url - The URL to send the request to
	 * @param {string} [options.method='POST'] - The HTTP method to use
	 * @param {object|Array} options.data - The data to send
	 * @param {Function} [options.merge] - Optional function to transform the response data
	 * @param {AbortSignal} [options.signal] - Optional AbortSignal for cancellation
	 * @param {boolean} [options.didRetry] - Whether this is a retry attempt after token refresh
	 * @returns {Promise<[object|null, Error|null, Response]>} Tuple of [entity, error, response]
	 */
	async create<Model extends (typeof PluralToSingularModelName)[keyof GenericCache]>(
		model: Model,
		{
			url,
			method = 'POST',
			data,
			merge,
			signal,
			didRetry,
		}: {
			url: string;
			method?: RequestInit['method'];
			data: object | Array<any>;
			merge?: (
				data: any,
				current: GenericCache[SingularToPluralModelNameMap[Model]][string],
			) => any;
			signal?: Request['signal'];
			didRetry?: boolean;
		},
	): Promise<
		[GenericCache[SingularToPluralModelNameMap[Model]][string] | null, Error | null, Response]
	> {
		await this.refreshTokens();

		const response = await fetchWithAuth(`${url}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		if (response.status === 401 && !didRetry) {
			await this.refreshTokens();

			return this.create(model, {
				url,
				merge,
				method,
				data,
				signal,
				didRetry: true,
			});
		}

		const json = (await response.json()) as
			| GenericCache[keyof GenericCache][string]
			| ApiError;

		if (!json) {
			return [null, new Error('No json returned from server'), response];
		}

		if (isApiError(json)) {
			return [null, new Error(json.message), response];
		}

		const state = this.cache.getState();
		const formatted = merge
			? merge(
					json,
					denormalize(
						state[SingularToPluralModelName[model]][json.id],
						SingularModelNameToSchema[model],
						state,
					),
			  )
			: json;

		if (response.ok && formatted) {
			this.set(model, formatted);

			const state = this.cache.getState();
			return [
				denormalize(
					state[SingularToPluralModelName[model]][json.id],
					SingularModelNameToSchema[model],
					state,
				),
				null,
				response,
			];
		}

		return [null, new Error('Unknown error occurred'), response];
	}

	/**
	 * Update an existing entity via API and store it in the cache
	 * Example:
	 * const [user, error, response] = await cache.update('user', {
	 *   url: '/1/users',
	 *   data: { name: 'John Doe' },
	 * });
	 * @param {ModelName} model - The type of model to update
	 * @param {object} options - Update options
	 * @param {string} options.url - The URL to send the request to
	 * @param {string} [options.method='PUT'] - The HTTP method to use
	 * @param {object|Array} options.data - The data to send
	 * @param {Function} [options.merge] - Optional function to transform the response data
	 * @param {AbortSignal} [options.signal] - Optional AbortSignal for cancellation
	 * @param {boolean} [options.didRetry] - Whether this is a retry attempt after token refresh
	 * @returns {Promise<[object|null, Error|null, Response]>} Tuple of [entity, error, response]
	 */
	async update<Model extends (typeof PluralToSingularModelName)[keyof GenericCache]>(
		model: Model,
		{
			url,
			method = 'PUT',
			data,
			merge,
			signal,
			didRetry,
		}: {
			url: string;
			method?: RequestInit['method'];
			data: object | Array<any>;
			merge?: (
				data: any,
				current: GenericCache[SingularToPluralModelNameMap[Model]][string],
			) => any;
			signal?: Request['signal'];
			didRetry?: boolean;
		},
	): Promise<
		[GenericCache[SingularToPluralModelNameMap[Model]][string] | null, Error | null, Response]
	> {
		await this.refreshTokens();

		const response = await fetchWithAuth(`${url}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		if (response.status === 401 && !didRetry) {
			await this.refreshTokens();

			return this.update(model, {
				url,
				merge,
				method,
				data,
				signal,
				didRetry: true,
			});
		}

		const json = (await response.json()) as
			| GenericCache[keyof GenericCache][string]
			| ApiError;

		if (!json) {
			return [null, new Error('No json returned from server'), response];
		}

		if (isApiError(json)) {
			return [null, new Error(json.message), response];
		}

		const state = this.cache.getState();
		const formatted = merge
			? merge(
					json,
					denormalize(
						state[SingularToPluralModelName[model]][json.id],
						SingularModelNameToSchema[model],
						state,
					),
			  )
			: json;

		if (response.ok && formatted) {
			this.set(model, formatted);

			const state = this.cache.getState();
			return [
				denormalize(
					state[SingularToPluralModelName[model]][json.id],
					SingularModelNameToSchema[model],
					state,
				),
				null,
				response,
			];
		}

		return [null, new Error('Unknown error occurred'), response];
	}

	clear() {
		const { _update, ...state } = this.cache.getState();

		for (const model in state) {
			state[model as keyof GenericCache] = {};
		}

		_update(state);
		this.httpCache.setState({
			requests: {},
			lastTokenRefresh: null,
		});
	}
}

/**
 * Singleton instance of the Cache class
 */
export const cache = new Cache();

// @ts-expect-error - TODO: fix this
window.cache = cache;
// @ts-expect-error - TODO: fix this
window._cache = cache.cache;

/**
 * Hook to access a single model from the cache with a selector
 * Example:
 * const name = useModel('user', currentUserId, (user) => user.name);
 * @param {ModelName} modelName - The type of model to access
 * @param {string|number|null|undefined} id - The ID of the entity to access
 * @param {Function} selector - Function to select specific data from the entity
 * @returns {any} The selected data
 */
export const useModel = <
	Model extends (typeof PluralToSingularModelName)[keyof GenericCache],
	SelectorResult,
	Entity extends GenericCache[SingularToPluralModelNameMap[Model]][string],
>(
	modelName: Model,
	id: string | number | null | undefined,
	selector: (state: Entity | null) => SelectorResult,
) => {
	return cache.cache(
		useShallow<GenericCache, SelectorResult>((state) => {
			if (!id) {
				return selector(null);
			}

			const entityKey = SingularToPluralModelName[modelName] as keyof GenericCache;
			// @ts-expect-error - TODO: fix this
			const schema = SingularModelNameToSchema[modelName] as GenericCache[Model][string];

			// @ts-expect-error - TODO: fix this
			const model = denormalize(state[entityKey][id], schema, state) as Entity | null;

			if (!model) {
				return selector(null);
			}

			return selector(model);
		}),
	);
};

/**
 * Hook to access multiple models from the cache with a selector
 * Example:
 * const users = useModels('user', (state) => state.filter((user) => user.name === "John"))
 * @param {ModelName} modelName - The type of models to access
 * @param {Function} selector - Function to select specific data from the entities
 * @returns {any|null} The selected data or null if no entities exist
 */
export const useModels = <
	Model extends keyof GenericCache,
	SelectorResult,
	Entity extends NonNullable<GenericCache[Model][string]>,
>(
	modelName: Model,
	selector: (items: Entity[]) => SelectorResult,
): SelectorResult => {
	return cache.cache(
		useShallow<GenericCache, SelectorResult>((state) => {
			// @ts-expect-error - TODO: fix this
			const schema = PluralModelNameToSchema[modelName] as GenericCache[Model][string];
			// @ts-expect-error - TODO: fix this
			const denormalized = denormalize(state[modelName], schema, state);

			if (!Object.keys(denormalized).length) {
				return selector([]);
			}

			return selector(Object.values(denormalized).filter(Boolean) as NonNullable<Entity>[]);
		}),
	);
};
