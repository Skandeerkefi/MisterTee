import { create } from "zustand";
import api from "@/lib/api";
import axios from "axios";

export interface CSBattleAffiliateUser {
	uuid: string;
	username: string;
	avatar: string | null;
	wager: number;
	rank: number;
}

interface Period {
	from: string;
	to: string;
}

interface CSBattleAffiliateState {
	users: CSBattleAffiliateUser[];
	period: Period | null;
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
				const m = (errField as { message?: unknown }).message;
				if (typeof m === "string") return m;
			}
		}
		return error.message || "Failed to load CSBattle leaderboard";
	}
	if (error instanceof Error) return error.message;
	return "Failed to load CSBattle leaderboard";
}

export const useCSBattleAffiliateStore = create<CSBattleAffiliateState>((set) => ({
	users: [],
	period: null,
	loading: false,
	error: null,

	fetchLeaderboard: async () => {
		set({ loading: true, error: null });
		try {
			const { data } = await api.get<{
				users: CSBattleAffiliateUser[];
				period?: Period;
			}>("/api/leaderboard/csbattle");

			const users = Array.isArray(data.users) ? data.users : [];
			const sorted = [...users].sort((a, b) => a.rank - b.rank);

			set({
				users: sorted,
				period: data.period ?? null,
				loading: false,
			});
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
