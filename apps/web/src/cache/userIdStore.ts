import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

export const userIdStore = create<{
	id: number | null;
	set: (id: number | null) => void;
}>((set) => ({
	id: null,
	set: (id: number | null) => set({ id }),
}));

export const useUserId = () => userIdStore(useShallow((state) => state.id));
