import { create } from 'zustand';

interface LowConfidenceState {
	lastShownLowConfidenceAlert: Date | null;
	setLastShownLowConfidenceAlert: (date: Date) => void;
}

export const useLowConfidenceStore = create<LowConfidenceState>((set) => ({
	lastShownLowConfidenceAlert: null,
	setLastShownLowConfidenceAlert: (date: Date) => set((state) => ({ ...state, lastShownLowConfidenceAlert: date })),
}));
