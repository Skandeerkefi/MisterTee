import { create } from "zustand";
import api from "@/lib/api";
import axios from "axios";

export interface JuiceLeaderboardUser {
	id: string | number;
	username: string;
	avatar: string | null;
	purchases: number;
	weighted_play_amount: number;
	raw_play_amount: number;
	rank: number;
}

interface JuiceLeaderboardPeriod {
	startDate: string;
	endDate: string;
	type: string;
}

interface JuiceLeaderboardState {
	users: JuiceLeaderboardUser[];
	period: JuiceLeaderboardPeriod | null;
	loading: boolean;
	error: string | null;
	fetchLeaderboard: () => Promise<void>;
}

function normalizeErrorMessage(error: unknown): string {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data;
		if (typeof data === "string") return data;
		if (data && typeof data === "object") {
			const errField = (data as { error?: unknown }).error;
			if (typeof errField === "string") return errField;
			if (errField && typeof errField === "object" && "message" in errField) {
				const message = (errField as { message?: unknown }).message;
				if (typeof message === "string") return message;
			}
		}
		return error.message || "Failed to load Juice leaderboard";
	}
	if (error instanceof Error) return error.message;
	return "Failed to load Juice leaderboard";
}

export const useJuiceLeaderboardStore = create<JuiceLeaderboardState>((set) => ({
	users: [],
	period: null,
	loading: false,
	error: null,

	fetchLeaderboard: async () => {
		set({ loading: true, error: null });
		try {
			const { data } = await api.get<{
				users: JuiceLeaderboardUser[];
				period?: JuiceLeaderboardPeriod;
			}>("/api/leaderboard/juice");

			const users = Array.isArray(data.users) ? [...data.users] : [];
			users.sort((a, b) => a.rank - b.rank);

			set({ users, period: data.period ?? null, loading: false });
		} catch (err: unknown) {
			set({
				error: normalizeErrorMessage(err),
				loading: false,
				users: [],
				period: null,
			});
		}
	},
}));