import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import httpStatus from 'http-status';
import config from './config/config';
import morgan from './config/morgan';
import xss from './middlewares/xss';
import { jwtStrategy } from './config/passport';
import { authLimiter } from './middlewares/rateLimiter';
import { router } from './routes/v1/router';
import { errorConverter, errorHandler } from './middlewares/error';
import { ApiError } from './utils/ApiError';
import { createServer } from 'http';
import './routes/v1';
import logger from './config/logger';
import { cleanupManager } from './utils/CleanupManager.util';

const app = express();

// Create HTTP server from Express app
const httpServer = createServer(app);

// Track connections to ensure graceful shutdown
const connections = new Set<any>();

// Track connection
httpServer.on('connection', (connection) => {
	connections.add(connection);
	connection.on('close', () => {
		connections.delete(connection);
	});
});

if (config.env !== 'test') {
	app.use(morgan.successHandler);
	app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// allows access to cookies with req.cookies
app.use(cookieParser());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// Enable CORS with options
app.use(
	cors({
		origin: [
			'https://scoutsense-app.vercel.app',
			'https://api-cool-morning-1320.fly.dev/',
			'http://localhost:3000',
			'http://localhost:3030',
			'http://localhost:4000',
		],
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
	}),
);

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok' });
});

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
	app.use('/1/auth', authLimiter);
}

// v1 api routes
app.use('/1', router);

app.get('/', (req, res) => {
	res.send('Hello World');
});

app.get('/health', (req, res) => {
	res.status(200).send('OK');
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
	next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

// Register cleanup handler
cleanupManager.addCleanupFunction(async (signal) => {
	logger.info(`Received ${signal}. Starting graceful shutdown...`);

	const shutdownTimeout = setTimeout(() => {
		logger.error('Could not close connections in time, forcefully shutting down');
		process.exit(1);
	}, 10000);

	try {
		// Close HTTP server first to stop accepting new connections
		await new Promise<void>((resolve, reject) => {
			httpServer.close((err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});

		logger.info('HTTP server closed.');

		// Clear the timeout since we're shutting down gracefully
		clearTimeout(shutdownTimeout);
	} catch (error) {
		logger.error('Error during graceful shutdown:', error);
		process.exit(1);
	}
});

// Export both app and httpServer
export { app as default, httpServer };
