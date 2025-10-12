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

// Automatically calculate the current week (Sunday -> Saturday)
function getCurrentWeekRange() {
	const now = new Date();

	// Get the most recent Sunday
	const day = now.getDay(); // 0 = Sunday and yes
	const diffToSunday = -day;
	const sunday = new Date(now);
	sunday.setDate(now.getDate() + diffToSunday);
	sunday.setHours(0, 0, 0, 0);

	// Saturday (6 days later)
	const saturday = new Date(sunday);
	saturday.setDate(sunday.getDate() + 6);
	saturday.setHours(23, 59, 59, 999);

	return {
		startDate: sunday.getTime(),
		endDate: saturday.getTime(),
	};
}

export const useCSGOLeadStore = create<CSGOLeadState>((set) => ({
	leaderboard: [],
	loading: false,
	error: null,

	fetchLeaderboard: async (take = 10, skip = 0) => {
		set({ loading: true, error: null });
		try {
			const { startDate, endDate } = getCurrentWeekRange();

			// 👇 This matches your backend route perfectly
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
//