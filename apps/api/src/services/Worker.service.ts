import logger from '../config/logger';
import { Job, Queue, Worker, QueueEvents } from 'bullmq';
import { Logger } from 'winston';
import { SchedulerManager } from './Scheduler.service';
import { cleanupManager } from '../utils/CleanupManager.util';
import { RedisConnection } from './reddis.service';

/**
 * Configuration options for a worker.
 */
type WorkerOptions = {
	/** Callback triggered when a job is added to the queue */
	onAdded?: (jobId: string) => void;
	/** Callback triggered when a job is completed successfully */
	onCompleted?: (jobId: string) => void;
	/** Callback triggered when a job fails */
	onFailed?: (jobId: string | undefined, failedReason: string) => void;
	/** Configuration for scheduled job execution */
	schedule?: {
		/** Interval in milliseconds between scheduled job executions */
		interval: number;
		/** Whether to run the job immediately on worker start */
		runOnStart: boolean;
	};
	/** Timeout in milliseconds for graceful shutdown (default: 30000) */
	gracefulShutdownTimeout?: number;
};

const uniqueJobs = new Set<string>();

const client = new RedisConnection('bullmq');

/**
 * Service for managing background job workers using BullMQ.
 * Handles job processing, scheduling, and graceful shutdown.
 *
 * @template Name - The name of the worker/queue
 * @template Data - The type of data passed to jobs
 */
export class WorkerService<Name extends string, Data extends Record<string, unknown>> {
	private name: Name;
	private fn: (job: Job, logger: Logger) => Promise<void>;
	private worker: Worker | null = null;
	private queueEvents: QueueEvents | null = null;
	private opts?: WorkerOptions;
	private logger: Logger;
	private isShuttingDown = false;
	private scheduler?: SchedulerManager<Name, Data>;

	/**
	 * Creates a new worker service.
	 *
	 * @param name - Unique name for the worker and its queue
	 * @param fn - Function to process jobs
	 * @param opts - Configuration options for the worker
	 * @throws Error if a worker with the same name already exists
	 */
	constructor(name: Name, fn: (job: Job, logger: Logger) => Promise<void>, opts?: WorkerOptions) {
		if (uniqueJobs.has(name)) {
			throw new Error(`Worker with name ${name} already exists`);
		}
		uniqueJobs.add(name);

		this.name = name;
		this.fn = fn;
		this.opts = {
			gracefulShutdownTimeout: 30000,
			...opts,
		};
		this.logger = logger.child({
			name,
		});

		if (this.opts?.schedule) {
			this.scheduler = new SchedulerManager<Name, Data>({
				name: this.name,
				interval: this.opts.schedule.interval,
				runOnStart: this.opts.schedule.runOnStart,
				addJob: (data) => this.add(data),
			});
			this.scheduler.start();
		}
	}

	/**
	 * Starts the worker to process jobs from the queue.
	 * Only runs if the current process is a worker process (PROCESS_TYPE=worker).
	 * Sets up event listeners and signal handlers for graceful shutdown.
	 */
	async start() {
		if (process.env.PROCESS_TYPE !== 'worker') {
			this.logger.info(
				`${this.name} is not a worker, as PROCESS_TYPE is ${process.env.PROCESS_TYPE}, skipping...`,
			);
			return;
		}

		this.worker = new Worker(
			this.name,
			async (job) => {
				if (this.isShuttingDown) {
					throw new Error('Worker is shutting down, not accepting new jobs');
				}

				this.logger.info(`${this.name} job:`, JSON.stringify(job.data, null, 2));

				try {
					await this.fn(job, this.logger);
				} catch (error) {
					this.logger.error(`${this.name} job: failed`, error);
					this.opts?.onFailed?.(job.id, error instanceof Error ? error.message : 'Unknown error');
					throw error;
				}
			},
			{
				connection: client.connection,
			},
		);

		// this.queueEvents = new QueueEvents(this.name, {
		// 	connection: client.connection,
		// });

		// this.queueEvents.on('added', ({ jobId }) => {
		// 	this.opts?.onAdded?.(jobId);
		// });

		// this.queueEvents.on('completed', ({ jobId }) => {
		// 	this.opts?.onCompleted?.(jobId);
		// });

		// this.queueEvents.on('failed', ({ jobId, failedReason }) => {
		// 	this.logger.error(`${this.name} job: failed`, jobId, failedReason);
		// 	this.opts?.onFailed?.(jobId, failedReason);
		// });

		cleanupManager.addCleanupFunction(async (signal) => {
			this.shutdown(signal);
		});
	}

	/**
	 * Handles graceful shutdown of the worker.
	 * Stops accepting new jobs, waits for current jobs to complete,
	 * and closes connections before exiting.
	 *
	 * @param signal - The signal that triggered the shutdown (SIGTERM or SIGINT)
	 */
	private async shutdown(signal: string) {
		this.isShuttingDown = true;

		if (!this.worker || !this.queueEvents) {
			this.logger.error(`${this.name} worker or queue events not found`);
			process.exit(0);
		}

		if (this.scheduler) {
			await this.scheduler.stop();
		}

		try {
			await this.worker.pause();

			const timeoutPromise = new Promise((_, reject) => {
				setTimeout(() => {
					reject(new Error('Shutdown timeout reached'));
				}, this.opts?.gracefulShutdownTimeout || 30000);
			});

			await Promise.race([
				Promise.all([this.worker.close(), this.queueEvents.close()]),
				timeoutPromise,
			]);

			process.exit(0);
		} catch (error) {
			this.logger.error(`Error during ${this.name} worker shutdown:`, error);
			process.exit(1);
		}
	}

	/**
	 * Adds a new job to the queue for processing.
	 *
	 * @param data - The data to be processed by the job
	 */
	async add(data: Data) {
		const queue = new Queue(this.name, {
			connection: client.connection,
			defaultJobOptions: { removeOnComplete: true, removeOnFail: 1000 },
		});
		await queue.add(this.name, data);
		queue.close();
	}
}
