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

// ✅ Fixed range: November 1 → November 8
function getFixedWeekRange() {
	const start = Date.UTC(2025, 10, 1, 0, 0, 0, 0);
	const end = Date.UTC(2025, 10, 8, 23, 59, 59, 999);

	return {
		startDate: start,
		endDate: end,
	};
}

export const useCSGOLeadStore = create<CSGOLeadState>((set) => ({
	leaderboard: [],
	loading: false,
	error: null,

	fetchLeaderboard: async (take = 10, skip = 0) => {
		set({ loading: true, error: null });
		try {
			const { startDate, endDate } = getFixedWeekRange();

			const res = await fetch(
				`https://misterteedata-production.up.railway.app/api/leaderboard/csgowin?take=${take}&skip=${skip}&startDate=${startDate}&endDate=${endDate}`
			);

			if (!res.ok) throw new Error("Failed to fetch leaderboard");

			const data = await res.json();
			set({ leaderboard: data.data || [], loading: false });
		} catch (err: any) {
			set({ error: err.message || "Unknown error", loading: false });
		}
	},
}));
