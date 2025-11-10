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
function getDynamicWeekRangeUTC() {
	const baseDate = Date.UTC(2025, 10, 10, 0, 0, 0, 0); // Nov 10, 2025 UTC
	const now = Date.now();

	// Calculate number of 7-day periods since base date
	const diffWeeks = Math.floor((now - baseDate) / (8 * 24 * 60 * 60 * 1000));

	// Start date of current week
	const startDate = baseDate + diffWeeks * 8 * 24 * 60 * 60 * 1000;

	// End date (7 days later)
	const endDate = startDate + 8 * 24 * 60 * 60 * 1000 - 1;

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
			const { startDate, endDate } = getDynamicWeekRangeUTC();

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
