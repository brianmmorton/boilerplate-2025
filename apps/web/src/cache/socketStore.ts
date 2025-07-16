import { create } from 'zustand';
import { Socket, io } from 'socket.io-client';

interface RecentUpdate {
	id: string | number;
	timestamp: number;
	type: 'create' | 'update' | 'delete';
	modelName: string;
}

interface SocketState {
	isConnected: boolean;
	recentUpdates: RecentUpdate[];
	socket: Socket | null;
	setIsConnected: (isConnected: boolean) => void;
	addUpdate: (update: RecentUpdate) => void;
	removeUpdate: (timestamp: number) => void;
	setSocket: (socket: Socket | null) => void;
	hasRecentUpdate: (entityId: string | number, modelName?: string) => boolean;
	getRecentUpdateType: (
		entityId: string | number,
		modelName?: string,
	) => 'create' | 'update' | 'delete' | null;
}

export const useSocketStore = create<SocketState>((set, get) => ({
	isConnected: false,
	recentUpdates: [],
	socket: null,
	setIsConnected: (isConnected) => set({ isConnected }),
	setSocket: (socket) => set({ socket }),
	addUpdate: (update) =>
		set((state) => ({
			recentUpdates: [update, ...state.recentUpdates.slice(0, 9)],
		})),
	removeUpdate: (timestamp) =>
		set((state) => ({
			recentUpdates: state.recentUpdates.filter((u) => u.timestamp !== timestamp),
		})),
	hasRecentUpdate: (entityId, modelName) => {
		const state = get();
		return state.recentUpdates.some(
			(update) =>
				update.id.toString() === entityId.toString() &&
				Date.now() - update.timestamp < 3000 &&
				(!modelName || update.modelName === modelName),
		);
	},
	getRecentUpdateType: (entityId, modelName) => {
		const state = get();
		const update = state.recentUpdates.find(
			(update) =>
				update.id.toString() === entityId.toString() &&
				Date.now() - update.timestamp < 3000 &&
				(!modelName || update.modelName === modelName),
		);
		return update?.type || null;
	},
}));
