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

// ✅ Fixed UTC date range: 20 Nov → 3 Dec
function getFixedRangeUTC() {
	// Months are 0-based → 10 = November, 11 = December
	const startDate = Date.UTC(2025, 10, 20, 0, 0, 0, 0); // 20 Nov 2025 UTC
	const endDate = Date.UTC(2025, 11, 3, 23, 59, 59, 999); // 3 Dec 2025 UTC end of day

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
			const { startDate, endDate } = getFixedRangeUTC();

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
