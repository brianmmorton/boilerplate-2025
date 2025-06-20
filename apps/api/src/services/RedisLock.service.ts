import { redisConnection } from './reddis.service';

export class RedisLock {
	private redis = redisConnection.connection;
	private lockKey: string;
	private lockValue: string;
	private ttl: number;
	private renewInterval: NodeJS.Timeout | null = null;
	private released = false;

	constructor(lockKey: string, ttlMs = 30000) {
		this.lockKey = `lock:${lockKey}`; // Add prefix to easily identify lock keys
		this.lockValue = `${process.pid}-${Date.now()}`;
		this.ttl = ttlMs;
	}

	async acquire(): Promise<boolean> {
		const acquired = await this.redis.set(this.lockKey, this.lockValue, 'PX', this.ttl, 'NX');

		if (acquired === 'OK') {
			this.released = false;
			// Start renewing the lock
			this.renewInterval = setInterval(async () => {
				await this.renew();
			}, this.ttl / 2);

			// Add safety cleanup in case release() is not called
			process.on('beforeExit', async () => {
				if (!this.released) {
					await this.release();
				}
			});

			return true;
		}

		return false;
	}

	async release(): Promise<void> {
		if (this.renewInterval) {
			clearInterval(this.renewInterval);
			this.renewInterval = null;
		}

		this.released = true;

		// Only delete if we still own the lock
		const script = `
				if redis.call("get", KEYS[1]) == ARGV[1] then
					return redis.call("del", KEYS[1])
				else
					return 0
				end
			`;
		await this.redis.eval(script, 1, this.lockKey, this.lockValue);
	}

	private async renew(): Promise<void> {
		const script = `
			if redis.call("get", KEYS[1]) == ARGV[1] then
				return redis.call("pexpire", KEYS[1], ARGV[2])
			else
				return 0
			end
		`;
		await this.redis.eval(script, 1, this.lockKey, this.lockValue, this.ttl);
	}

	// Static method to clean up old locks
	async cleanupOldLocks(pattern = 'lock:*', maxAge = 86400000): Promise<number> {
		const keys = await this.redis.keys(pattern);
		let cleaned = 0;

		for (const key of keys) {
			// Get the TTL of the key
			const ttl = await this.redis.pttl(key);

			// If TTL is -1 (no expiry set) or the key is older than maxAge
			if (ttl === -1 || ttl > maxAge) {
				await this.redis.del(key);
				cleaned++;
			}
		}

		return cleaned;
	}
}
