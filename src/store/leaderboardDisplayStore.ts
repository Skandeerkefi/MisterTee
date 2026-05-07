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
			set({ config: data, loading: false });
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
			set({ config: data });
			return data;
		} catch (err) {
			throw new Error(normalizeError(err));
		}
	},
}));
