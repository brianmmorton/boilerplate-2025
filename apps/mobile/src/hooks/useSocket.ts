import { io } from 'socket.io-client';
import { useEffect } from 'react';
import { cache, SingularModelName } from '../cache/cache';
import { useSocketStore } from '../cache/socketStore';

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
};

export const useSocket = () => {
	const { setIsConnected, setSocket, addUpdate } = useSocketStore();

	useEffect(() => {
		const socket = io(process.env.REACT_APP_API_URL ?? '', {
			withCredentials: true,
		});

		setSocket(socket);

		socket.on('connect', () => {
			setIsConnected(true);
		});

		socket.on('disconnect', () => {
			setIsConnected(false);
		});

		socket.on('message', (message: string) => {
			try {
				const data = JSON.parse(message);
				const { type, modelName, id } = data;

				// Update the cache
				const cacheKey = ModelNameToCacheKey[modelName];
				if (cacheKey) {
					if (type === 'delete') {
						cache.remove(cacheKey, id.toString());
					} else {
						// Force a refetch by removing the item from cache
						cache.remove(cacheKey, id.toString());
					}
				}

				// Add to recent updates
				addUpdate({
					id,
					timestamp: Date.now(),
					type,
					modelName,
				});

				// Clean up old updates after 3 seconds
				setTimeout(() => {
					useSocketStore.getState().removeUpdate(Date.now());
				}, 3000);
			} catch (error) {
				console.error('Failed to parse socket message:', error);
			}
		});

		return () => {
			socket.disconnect();
			setSocket(null);
		};
	}, [setIsConnected, setSocket, addUpdate]);
};

// Export helper functions for components that need to check update status
export const hasRecentUpdate = useSocketStore.getState().hasRecentUpdate;
export const getRecentUpdateType = useSocketStore.getState().getRecentUpdateType;
