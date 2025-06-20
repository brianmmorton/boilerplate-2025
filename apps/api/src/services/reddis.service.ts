import Redis from 'ioredis';
import { cleanupManager } from '../utils/CleanupManager.util';
import config from '../config/config';
import logger from '../config/logger';

export class RedisConnection {
	public connection: Redis;
	private logger = logger.child({
		name: 'redis-connection',
	});

	async getConnection(): Promise<Redis> {
		return this.connection;
	}

	constructor(name: string) {
		this.connection = new Redis(config.redis.url, {
			name,
			connectTimeout: 10000,
			disconnectTimeout: 2000,
			enableOfflineQueue: true,
			enableReadyCheck: true,
			maxRetriesPerRequest: null, // for bullmq
		});
		// Initialize cleanup handler
		cleanupManager.addCleanupFunction(async () => {
			this.connection.quit();
			this.connection.disconnect();
		});

		this.connection.on('ready', () => {
			this.logger.info('Successfully connected to redis');
		});

		this.connection.on('error', (error) => {
			// @ts-expect-error idk this is incorrectly typed
			if (error.error === 'Connection is closed.') {
				// server shut down
				return;
			}
			this.logger.error('Error connecting to redis', {
				error,
				redisUrl: config.redis.url,
			});
		});
	}
}

export const redisConnection = new RedisConnection(process.env.PROCESS_TYPE ?? 'default');
