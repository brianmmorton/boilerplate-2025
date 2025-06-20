import logger from './config/logger';
import express from 'express';
import { socketService } from './services/socket.service';
import { createServer } from 'http';
import { cleanupManager } from './utils/CleanupManager.util';
import { exampleWorker } from './workers/example.worker';

const app = express();

const workerLogger = logger.child({
	name: 'worker',
});

const startWorker = () => {
	exampleWorker.start();
	workerLogger.info('Worker process started');
};

if (process.env.PROCESS_TYPE === 'worker') {
	const httpServer = createServer(app);

	socketService.setup(httpServer);

	workerLogger.info(`Worker ${process.pid} started`);

	app.get('/', (req, res) => {
		res.status(200).send('OK');
	});

	// add health check endpoint
	app.get('/health', (req, res) => {
		res.status(200).send('OK');
	});

	const server = app.listen(3000, () => {
		workerLogger.info('Health check endpoint started on port 3000');
	});

	cleanupManager.addCleanupFunction(async () => {
		server.close();
	});

	startWorker();
}
