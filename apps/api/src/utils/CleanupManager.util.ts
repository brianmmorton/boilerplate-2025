export class CleanupManager {
	private static instance: CleanupManager;
	private cleanupFunctions: Array<
		(
			signal: 'SIGTERM' | 'SIGINT' | 'uncaughtException' | 'unhandledRejection',
		) => Promise<void> | void
	> = [];
	private isShuttingDown = false;

	private constructor() {
		this.setupExitHandlers();
	}

	public static getInstance(): CleanupManager {
		if (!CleanupManager.instance) {
			CleanupManager.instance = new CleanupManager();
		}
		return CleanupManager.instance;
	}

	private setupExitHandlers(): void {
		// Handle graceful shutdown signals
		process.on('SIGTERM', () => this.performCleanup('SIGTERM'));
		process.on('SIGINT', () => this.performCleanup('SIGINT'));

		// Handle uncaught exceptions and unhandled rejections
		process.on('uncaughtException', (error) => {
			console.error('Uncaught Exception:', error);
			this.performCleanup('uncaughtException');
		});

		process.on('unhandledRejection', (reason, promise) => {
			console.error('Unhandled Rejection at:', promise, 'reason:', reason);
			this.performCleanup('unhandledRejection');
		});
	}

	public addCleanupFunction(
		fn: (
			signal: 'SIGTERM' | 'SIGINT' | 'uncaughtException' | 'unhandledRejection',
		) => Promise<void> | void,
	): void {
		this.cleanupFunctions.push(fn);
	}

	public removeCleanupFunction(
		fn: (signal: 'SIGTERM' | 'SIGINT' | 'uncaughtException' | 'unhandledRejection') => void,
	): void {
		this.cleanupFunctions = this.cleanupFunctions.filter((f) => f !== fn);
	}

	private async performCleanup(
		signal: 'SIGTERM' | 'SIGINT' | 'uncaughtException' | 'unhandledRejection',
	): Promise<void> {
		if (this.isShuttingDown) {
			return;
		}

		this.isShuttingDown = true;
		console.log(`\nReceived ${signal}. Starting cleanup...`);

		try {
			// Execute all cleanup functions in parallel
			await Promise.all(
				this.cleanupFunctions.map(async (fn) => {
					try {
						await fn(signal);
					} catch (error) {
						console.error('Error during cleanup:', error);
					}
				}),
			);

			console.log('Cleanup completed successfully');
		} catch (error) {
			console.error('Error during cleanup:', error);
		}

		// Exit with different codes based on the signal
		if (signal === 'uncaughtException' || signal === 'unhandledRejection') {
			process.exit(1);
		} else {
			process.exit(0);
		}
	}
}

// Export a singleton instance
export const cleanupManager = CleanupManager.getInstance();
