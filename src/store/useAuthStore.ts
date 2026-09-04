import { create } from "zustand";
import { getApiBaseUrl } from "@/lib/apiBase";

interface User {
	id: string;
	kickUsername: string;
	rainbetUsername?: string;
	discordUsername?: string;
	discordId?: string;
	kickId?: string;
	role: string;
	hasLinkedKick?: boolean;
	hasLinkedDiscord?: boolean;
	pointsBalance?: number;
}

interface AuthState {
	user: User | null;
	token: string | null;
	isLoading: boolean;
	setUser: (user: User | null) => void;
	setToken: (token: string | null) => void;
	setIsLoading: (loading: boolean) => void;
	logout: () => void;
	loadFromStorage: () => void;
	updatePointsBalance: (balance: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	token: null,
	isLoading: false,

	setUser: (user) => set({ user }),
	setToken: (token) => set({ token }),
	setIsLoading: (loading) => set({ isLoading: loading }),
	updatePointsBalance: (balance) => set((state) => ({ user: state.user ? { ...state.user, pointsBalance: balance } : null })),

	logout: () => {
		set({ user: null, token: null });
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	},

	loadFromStorage: () => {
		const token = localStorage.getItem("token");
		const userStr = localStorage.getItem("user");
		if (token && userStr) {
			try {
				const user = JSON.parse(userStr);
				if (!user.role || typeof user.role !== "string") user.role = "user";
				set({ token, user });
			} catch {
				set({ token: null, user: null });
			}
		} else {
			set({ token: null, user: null });
		}
	},
}));
