import { create } from "zustand";

export type LeaderboardPeriod = "monthly";

export interface LeaderboardPlayer {
	rank: number;
	username: string;
	wager: number;
	isFeatured?: boolean;
}

interface LeaderboardState {
	monthlyLeaderboard: LeaderboardPlayer[];
	period: LeaderboardPeriod;
	isLoading: boolean;
	error: string | null;
	setPeriod: (period: LeaderboardPeriod) => void;
	fetchLeaderboard: () => Promise<void>;
}

const API_URL =
	"https://misterteedata-production.up.railway.app/api/affiliates";

const getDateRange = (
	period: LeaderboardPeriod
): { start_at: string; end_at: string } => {
	const now = new Date();

	// Monthly: start at first day of month, end at last day of month
	const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
	const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
	startDate.setHours(0, 0, 0, 0);
	endDate.setHours(23, 59, 59, 999);

	return {
		start_at: startDate.toISOString().split("T")[0],
		end_at: endDate.toISOString().split("T")[0],
	};
};

const processApiData = (data: any): LeaderboardPlayer[] => {
	if (!data?.affiliates || !Array.isArray(data.affiliates)) {
		console.error("Invalid API response structure - missing affiliates array");
		return [];
	}

	return data.affiliates
		.filter((item: any) => item && item.username)
		.map((item: any, index: number) => ({
			rank: index + 1,
			username: item.username,
			wager: parseFloat(item.wagered_amount) || 0,
			isFeatured: item.username.toLowerCase().includes("5moking"),
		}))
		.sort((a, b) => b.wager - a.wager)
		.map((player, idx) => ({ ...player, rank: idx + 1 }));
};

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
	monthlyLeaderboard: [],
	period: "monthly",
	isLoading: false,
	error: null,
	setPeriod: (period) => set({ period }),
	fetchLeaderboard: async () => {
		set({ isLoading: true, error: null });
		try {
			const { start_at, end_at } = getDateRange("monthly");
			const response = await fetch(
				`${API_URL}?start_at=${start_at}&end_at=${end_at}`
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new Error(
					errorData?.message ||
						errorData?.error ||
						`API request failed with status ${response.status}`
				);
			}

			const data = await response.json();
			const processedData = processApiData(data);

			set({ monthlyLeaderboard: processedData });
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			set({ isLoading: false });
		}
	},
}));
