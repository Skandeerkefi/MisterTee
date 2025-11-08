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

function getCurrentWeekRangeUTC() {
	const now = new Date();

	// Sunday (0) as start of the week in UTC
	const day = now.getUTCDay(); 
	const diffToSunday = -day;

	const start = new Date(Date.UTC(
		now.getUTCFullYear(),
		now.getUTCMonth(),
		now.getUTCDate() + diffToSunday
	));
	start.setUTCHours(0, 0, 0, 0);

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
