import config from './config';

// Shared Redis configuration
export const redisConfig = {
	url: config.redis.url,
	options: {
		connectTimeout: 10000,
		disconnectTimeout: 2000,
		enableOfflineQueue: true,
		enableReadyCheck: true,
		maxRetriesPerRequest: null, // for bullmq
	},
};
