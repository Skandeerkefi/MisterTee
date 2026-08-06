import { create } from "zustand";
import api from "@/lib/api";
import axios from "axios";

export type RankPrizes = Record<string, number>;

export interface LeaderboardDisplayConfig {
	roobet: {
		startDate: string | null;
		endDate: string | null;
		prizes: RankPrizes;
	};
	csbattle: {
		from: string;
		to: string;
		prizes: RankPrizes;
	};
	juice: {
		startDate: string;
		endDate: string;
		prizes: RankPrizes;
	};
}

const DEFAULT_ROOBET_PRIZES: RankPrizes = {
	1: 675,
	2: 300,
	3: 175,
	4: 100,
	5: 80,
	6: 70,
	7: 50,
	8: 25,
	9: 25,
};

const DEFAULT_CSBATTLE_PRIZES: RankPrizes = {
	1: 500,
	2: 300,
	3: 150,
	4: 100,
	5: 75,
	6: 50,
	7: 25,
};

const DEFAULT_JUICE_PRIZES: RankPrizes = {
	1: 500,
	2: 300,
	3: 150,
	4: 100,
	5: 75,
	6: 50,
	7: 25,
	8: 0,
	9: 0,
	10: 0,
};

const getCurrentUtcMonthRange = () => {
	const now = new Date();
	const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
	const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
	return {
		startDate: start.toISOString().slice(0, 10),
		endDate: end.toISOString().slice(0, 10),
	};
};

export function normalizeLeaderboardDisplayConfig(
	config: LeaderboardDisplayConfig | null | undefined
): LeaderboardDisplayConfig {
	const month = getCurrentUtcMonthRange();
	return {
		roobet: {
			startDate: config?.roobet?.startDate ?? null,
			endDate: config?.roobet?.endDate ?? null,
			prizes: { ...DEFAULT_ROOBET_PRIZES, ...(config?.roobet?.prizes ?? {}) },
		},
		csbattle: {
			from: config?.csbattle?.from ?? "2025-04-10 00:00:00",
			to: config?.csbattle?.to ?? "2030-04-19 23:59:59",
			prizes: { ...DEFAULT_CSBATTLE_PRIZES, ...(config?.csbattle?.prizes ?? {}) },
		},
		juice: {
			startDate: config?.juice?.startDate ?? month.startDate,
			endDate: config?.juice?.endDate ?? month.endDate,
			prizes: { ...DEFAULT_JUICE_PRIZES, ...(config?.juice?.prizes ?? {}) },
		},
	};
}

interface State {
	config: LeaderboardDisplayConfig | null;
	loading: boolean;
	error: string | null;
	fetchConfig: () => Promise<void>;
	saveConfig: (
		body: LeaderboardDisplayConfig,
		token: string
	) => Promise<LeaderboardDisplayConfig>;
}

function normalizeError(err: unknown): string {
	if (axios.isAxiosError(err)) {
		const d = err.response?.data;
		if (typeof d === "object" && d && "error" in d) {
			return String((d as { error: string }).error);
		}
		return err.message;
	}
	if (err instanceof Error) return err.message;
	return "Request failed";
}

export const useLeaderboardDisplayStore = create<State>((set) => ({
	config: null,
	loading: false,
	error: null,

	fetchConfig: async () => {
		set({ loading: true, error: null });
		try {
			const { data } = await api.get<LeaderboardDisplayConfig>(
				"/api/leaderboard/display-settings"
			);
			set({ config: normalizeLeaderboardDisplayConfig(data), loading: false });
		} catch (err) {
			set({ error: normalizeError(err), loading: false });
		}
	},

	saveConfig: async (body, token) => {
		try {
			const { data } = await api.put<LeaderboardDisplayConfig>(
				"/api/admin/leaderboard-display-settings",
				body,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			const normalized = normalizeLeaderboardDisplayConfig(data);
			set({ config: normalized });
			return normalized;
		} catch (err) {
			throw new Error(normalizeError(err));
		}
	},
}));
