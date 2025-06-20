import { Server } from 'socket.io';
import logger from '../config/logger';
import { Server as HttpServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import {
	User,
} from '@prisma/client';
import { cleanupManager } from '../utils/CleanupManager.util';
import { redisConnection } from './reddis.service';

const childLogger = logger.child({
	name: 'socket-service',
});

export interface UserUpdate {
	room: `user:${number}`;
	type: 'create' | 'update' | 'delete';
	modelName: 'User';
	data: User;
}

type Message =
	| UserUpdate

export class SocketService {
	private io: Server | undefined;
	private redisConnection = redisConnection.connection;

	async setup(httpServer: HttpServer) {
		// Get Redis clients from the pool
		const pubClient = this.redisConnection;
		const subClient = pubClient.duplicate();

		this.io = new Server(httpServer, {
			cors: {
				origin: [
					'https://firstpick-app.vercel.app',
					'http://localhost:3000',
					'http://localhost:3030',
					'http://localhost:4000',
				],
				credentials: true,
			},
			adapter: createAdapter(pubClient, subClient),
		});

		// Add error handlers for both clients
		pubClient.on('error', (err) => {
			logger.error('Redis pub client error:', err);
		});

		subClient.on('error', (err) => {
			logger.error('Redis sub client error:', err);
		});

		// Log connection events
		pubClient.on('connect', () => {
			childLogger.info('Redis pub client connected');
		});
		subClient.on('connect', () => {
			childLogger.info('Redis sub client connected');
		});

		pubClient.on('error', (err) => {
			childLogger.error('Redis client error', {
				error: err.message,
				stack: err.stack,
			});
		});
		subClient.on('error', (err) => {
			childLogger.error('Redis sub client error', {
				error: err.message,
				stack: err.stack,
			});
		});

		pubClient.on('close', () => {
			childLogger.info('Redis client connection closed');
		});
		subClient.on('close', () => {
			childLogger.info('Redis sub client connection closed');
		});

		// Register cleanup handler
		cleanupManager.addCleanupFunction(async () => {
			try {
				await Promise.all([
					this.io?.close(),
					pubClient.quit(),
					subClient.quit(),
					pubClient.disconnect(),
					subClient.disconnect(),
				]);
			} catch (err) {
				childLogger.error('Error closing Redis connection', {
					error: err instanceof Error ? err.message : String(err),
				});
				// Force close if quit fails
				pubClient.disconnect();
				subClient.disconnect();
			}
		});

		this.io.on('connection', (socket) => {
			logger.info('Client connected:', socket.id);

			socket.on('disconnect', () => {
				logger.info('Client disconnected:', socket.id);
			});

			socket.on('joinProduct', (productId) => {
				logger.info(`Socket ${socket.id} joining product room:`, productId);
				socket.join(`product:${productId}`);
				socket.emit('joinProduct', productId);
			});

			socket.on('leaveProduct', (productId) => {
				logger.info(`Socket ${socket.id} leaving product room:`, productId);
				socket.leave(`product:${productId}`);
				socket.emit('leaveProduct', productId);
			});
		});
	}

	public emitToRoom(message: Message): void {
		try {
			if (!this.io) {
				childLogger.error('Socket.IO connection not initialized', {
					room: message.room,
					message: message.type,
				});
				return;
			}

			// Handle regular delta updates
			const delta = {
				action: message.type,
				modelName: message.modelName,
				data: message.data,
			};
			this.io.to(message.room).emit('delta', JSON.stringify(delta));
		} catch (error) {
			console.log(error);
			childLogger.error('Failed to emit message to room', {
				error: error instanceof Error ? error.message : 'Unknown error',
				room: message.room,
				message: message.type,
			});
		}
	}
}

// Export a singleton instance
export const socketService = new SocketService();
