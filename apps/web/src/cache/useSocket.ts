import { io, Socket } from 'socket.io-client';
import { useCallback, useEffect } from 'react';
import { cache, SingularModelName } from './cache';
import { useSocketStore } from './socketStore';
import { useUserId } from './userIdStore';
import { useCurrentCompanyId } from './currentCompanyStore';

const ModelNameToCacheKey: Record<string, SingularModelName> = {
	ResearchStep: 'researchStep',
	Research: 'research',
	Product: 'product',
	Idea: 'idea',
	Company: 'company',
	PainPoint: 'painPoint',
	Source: 'source',
	Competitor: 'competitor',
	CompetitiveAlert: 'competitiveAlert',
	User: 'user',
};

interface ServerToClientEvents {
	noArg: () => void;
	basicEmit: (a: number, b: string, c: Buffer) => void;
	withAck: (d: string, callback: (e: number) => void) => void;
	delta: (message: string) => void;
	join: (modelAndId: string) => void;
}

interface ClientToServerEvents {
	join: (modelAndId: string) => void;
	leave: (modelAndId: string) => void;
}

export const useSocket = () => {
	const currentCompanyId = useCurrentCompanyId();
	const currentUserId = useUserId();
	const { setIsConnected, setSocket, addUpdate, socket } = useSocketStore();

	const join = useCallback(
		(socket: Socket<ServerToClientEvents, ClientToServerEvents>) => {
			if (currentUserId) {
				console.log('joining user', currentUserId);
				socket.emit('join', `user:${currentUserId}`);
			} else {
				socket.emit('leave', `user:${currentUserId}`);
			}

			if (currentCompanyId) {
				console.log('joining company', currentCompanyId);
				socket.emit('join', `company:${currentCompanyId}`);
			} else {
				socket.emit('leave', `company:${currentCompanyId}`);
			}
		},
		[currentUserId, currentCompanyId],
	);

	useEffect(() => {
		if (socket) {
			join(socket);
		}
	}, [socket, join]);

	useEffect(() => {
		if (socket) {
			return;
		}

		const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
			process.env.REACT_APP_API_URL ?? '',
			{
				withCredentials: true,
				reconnection: true,
				reconnectionAttempts: 100,
				reconnectionDelay: 1000,
				reconnectionDelayMax: 5000,
			},
		);

		newSocket.on('connect', () => {
			console.log('Socket: connected');
			setIsConnected(true);
			setSocket(newSocket);
			join(newSocket);
		});

		newSocket.io.on('reconnect', () => {
			console.log('Socket: reconnected');
			join(newSocket);
		});

		newSocket.on('disconnect', () => {
			console.log('Socket: disconnected');
			setIsConnected(false);
		});

		newSocket.on('delta', (message) => {
			try {
				const data = JSON.parse(message);
				const { action, modelName, data: modelData } = data;
				const id = modelData?.id;
				console.log('Socket: delta', data);

				const cacheKey = ModelNameToCacheKey[modelName];
				if (cacheKey) {
					if (action === 'delete') {
						cache.remove(cacheKey, id.toString());
					} else if (action === 'update' || action === 'create') {
						cache.set(cacheKey, modelData);
					}
				}

				addUpdate({
					id,
					timestamp: Date.now(),
					type: action,
					modelName,
				});

				setTimeout(() => {
					useSocketStore.getState().removeUpdate(Date.now());
				}, 3000);
			} catch (error) {
				console.error('Failed to parse socket message:', error);
			}
		});

		return () => {
			newSocket.disconnect();
			setSocket(null);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentUserId]); // Remove socket dependency to prevent infinite recreation
};

export const hasRecentUpdate = useSocketStore.getState().hasRecentUpdate;
export const getRecentUpdateType = useSocketStore.getState().getRecentUpdateType;
