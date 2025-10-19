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

// ✅ Automatically calculate the current week in UTC (Saturday → Friday)
function getCurrentWeekRangeUTC() {
	const now = new Date();

	// Get current day in UTC (0 = Sunday, 6 = Saturday)
	const day = now.getUTCDay();

	// Calculate how many days to go back to reach Saturday
	// If today is Saturday (6), diff = 0 → start today
	const diffToSaturday = day === 6 ? 0 : -((day + 1) % 7);

	// Start of the week (Saturday 00:00 UTC)
	const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diffToSaturday));
	start.setUTCHours(0, 0, 0, 0);

	// End of the week (Friday 23:59:59.999 UTC)
	const end = new Date(start);
	end.setUTCDate(start.getUTCDate() + 6);
	end.setUTCHours(23, 59, 59, 999);

	return {
		startDate: start.getTime(),
		endDate: end.getTime(),
	};
}

export const useCSGOLeadStore = create<CSGOLeadState>((set) => ({
	leaderboard: [],
	loading: false,
	error: null,

	fetchLeaderboard: async (take = 10, skip = 0) => {
		set({ loading: true, error: null });
		try {
			const { startDate, endDate } = getCurrentWeekRangeUTC();

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
