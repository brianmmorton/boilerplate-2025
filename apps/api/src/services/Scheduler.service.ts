import { RedisLock } from './RedisLock.service';
import logger from '../config/logger';

/**
 * Manages scheduled jobs with leader election to ensure only one instance runs the scheduler.
 * Uses Redis locks to coordinate between multiple instances of the application.
 *
 * @template Name - The name of the scheduler/job
 * @template Data - The type of data passed to scheduled jobs
 */
export class SchedulerManager<Name extends string, Data extends Record<string, unknown>> {
	private lock: RedisLock;
	private isLeader = false;
	private checkInterval: NodeJS.Timeout | null = null;
	private logger = logger.child({
		service: 'SchedulerManager',
	});
	private name: Name;
	private interval: number;
	private runOnStart: boolean;
	private addJob: (data: Data) => void;
	private scheduleInterval: NodeJS.Timeout | null = null;

	/**
	 * Creates a new scheduler manager.
	 *
	 * @param options - Configuration options for the scheduler
	 * @param options.name - Unique name for the scheduler
	 * @param options.interval - Interval in milliseconds between job executions
	 * @param options.runOnStart - Whether to run the job immediately when becoming leader
	 * @param options.addJob - Function to add a job to the queue
	 */
	constructor({
		name,
		interval = 15000,
		runOnStart = false,
		addJob,
	}: {
		name: Name;
		interval: number;
		runOnStart?: boolean;
		addJob: (job: Data) => void;
	}) {
		this.name = name;
		this.interval = interval;
		this.runOnStart = runOnStart;
		this.addJob = addJob;
		this.lock = new RedisLock(`scheduler-lock:${this.name}`, 30000); // 30 second TTL
	}

	/**
	 * Starts the scheduler manager.
	 * Attempts to become the leader immediately and sets up periodic leader election checks.
	 */
	async start() {
		// Try to become the leader immediately
		await this.tryBecomingLeader();

		// Periodically try to become the leader if we're not
		this.checkInterval = setInterval(async () => {
			await this.tryBecomingLeader();
			await this.lock.cleanupOldLocks(`scheduler-lock:*`, 30000);
		}, 15000); // Check every 15 seconds
	}

	/**
	 * Attempts to acquire the leader lock and start scheduling jobs if successful.
	 * If this instance becomes the leader, it will start scheduling jobs at the configured interval.
	 */
	private async tryBecomingLeader() {
		try {
			if (!this.isLeader) {
				const acquired = await this.lock.acquire();
				if (acquired) {
					this.isLeader = true;

					if (this.runOnStart) {
						this.addJob({} as Data);
					}

					this.scheduleInterval = setInterval(() => {
						this.addJob({} as Data);
					}, this.interval);

					this.logger.info(`Process ${process.pid} became the scheduler leader`);
				}
			}
		} catch (error) {
			this.logger.error('Error in leader election:', error);
			// If there's an error, release the lock and try again next time
			if (this.isLeader) {
				await this.stop();
			}
		}
	}

	/**
	 * Stops the scheduler manager.
	 * Clears all intervals and releases the leader lock if this instance is the leader.
	 */
	async stop() {
		if (this.checkInterval) {
			clearInterval(this.checkInterval);
			this.checkInterval = null;
		}

		if (this.scheduleInterval) {
			clearInterval(this.scheduleInterval);
			this.scheduleInterval = null;
		}

		if (this.isLeader) {
			await this.lock.release();
			this.isLeader = false;
			this.logger.info(`Process ${process.pid} released scheduler leadership`);
		}
	}
}
