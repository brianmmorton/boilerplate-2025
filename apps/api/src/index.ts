import { httpServer } from './app';
import logger from './config/logger';
import { socketService } from './services/socket.service';
import { cleanupManager } from './utils/CleanupManager.util';

const appLogger = logger.child({
	name: 'app',
});

const startServer = () => {
	const port = process.env.PORT || 3030;
	httpServer.listen(port, () => {
		appLogger.info(`🚀 Server is running on port ${port}`);
	});

	socketService.setup(httpServer);

	cleanupManager.addCleanupFunction(async () => {
		if (httpServer) {
			appLogger.info('Server is shutting down...');
			const shutdownTimeout = setTimeout(() => {
				appLogger.error('Could not close connections in time, forcefully shutting down');
				process.exit(1);
			}, 10000);

			try {
				await new Promise<void>((resolve, reject) => {
					httpServer.close((err) => {
						if (err) {
							reject(err);
						} else {
							resolve();
						}
					});
				});
				clearTimeout(shutdownTimeout);
				process.exit(0);
			} catch (error) {
				// @ts-expect-error N/a
				if (error.code === 'ERR_SERVER_NOT_RUNNING') {
					return;
				}
				appLogger.error('Error during server shutdown:', error);
				process.exit(1);
			}
		} else {
			process.exit(0);
		}
	});
};

// Only run clustering in API mode, not in worker mode
if (process.env.PROCESS_TYPE === 'api') {
	startServer();
	appLogger.info(`Worker ${process.pid} started`);
}
