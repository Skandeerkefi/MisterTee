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

// ✅ Dynamic weekly range generator — starts from Nov 10, 2025
function getDynamicRangeUTC() {
	const PERIOD_DAYS = 9;
	const GAP_DAYS = 1;
	const TOTAL_CYCLE = PERIOD_DAYS + GAP_DAYS; // 10 days

	const baseDate = Date.UTC(2025, 10, 10, 0, 0, 0, 0); // Nov 10, 2025 UTC
	const now = Date.now();

	// How many completed cycles passed?
	const cyclesPassed = Math.floor((now - baseDate) / (TOTAL_CYCLE * 24 * 60 * 60 * 1000));

	// Start date of the current period
	const startDate = baseDate + cyclesPassed * TOTAL_CYCLE * 24 * 60 * 60 * 1000;

	// End date: 9 days later (period length)
	const endDate = startDate + PERIOD_DAYS * 24 * 60 * 60 * 1000 - 1;

	return {
		startDate,
		endDate,
	};
}


export const useCSGOLeadStore = create<CSGOLeadState>((set) => ({
	leaderboard: [],
	loading: false,
	error: null,

	fetchLeaderboard: async (take = 10, skip = 0) => {
		set({ loading: true, error: null });
		try {
			const { startDate, endDate } = getDynamicRangeUTC();

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
