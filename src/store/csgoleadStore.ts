import { create } from "zustand";

interface LeaderboardEntry {
	name: string;
	wagered: number;
	deposited: number;
	createdAt: string;
}

interface CSGOLeadState {
	leaderboard: LeaderboardEntry[];
	loading: boolean;
	error: string | null;
	fetchLeaderboard: (take?: number, skip?: number) => Promise<void>;
}

export const useCSGOLeadStore = create<CSGOLeadState>((set) => ({
	leaderboard: [],
	loading: false,
	error: null,
	fetchLeaderboard: async (take = 10, skip = 0) => {
		set({ loading: true, error: null });
		try {
			const res = await fetch(
				`/api/leaderboard/csgowin?take=${take}&skip=${skip}`
			);
			const text = await res.text();
			let data;
			try {
				data = JSON.parse(text);
			} catch {
				throw new Error("Invalid JSON response: " + text);
			}
			set({ leaderboard: data.data || [], loading: false });
		} catch (err: any) {
			set({ error: err.message || "Unknown error", loading: false });
		}
	},
}));
