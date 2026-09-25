import { create } from "zustand";
import api from "@/lib/api";
import axios from "axios";

export interface RustUser {
	id: number | null;
	userId: number | null;
	username: string;
	avatar: string | null;
	level: number;
	wager: number;
	rank: number;
}

export interface RustPrize {
	place: number;
	amount: number;
}

export interface RustPeriod {
	from: string | null;
	to: string | null;
}

interface RustLeaderboardMeta {
	title: string | null;
	totalPrizePool: number;
	frequency: string | null;
	status: string | null;
}

interface RustResponse {
	users: RustUser[];
	prizes: RustPrize[];
	title: string | null;
	totalPrizePool: number;
	frequency: string | null;
	status: string | null;
	period: RustPeriod | null;
}

interface RustLeaderboardState {
	users: RustUser[];
	prizes: RustPrize[];
	meta: RustLeaderboardMeta;
	period: RustPeriod | null;
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
		return error.message || "Failed to load Rust leaderboard";
	}
	if (error instanceof Error) return error.message;
	return "Failed to load Rust leaderboard";
}

export const useRustLeaderboardStore = create<RustLeaderboardState>((set) => ({
	users: [],
	prizes: [],
	meta: { title: null, totalPrizePool: 0, frequency: null, status: null },
	period: null,
	loading: false,
	error: null,

	fetchLeaderboard: async () => {
		set({ loading: true, error: null });
		try {
			const { data } = await api.get<RustResponse>("/api/leaderboard/rust");

			set({
				users: Array.isArray(data.users) ? data.users : [],
				prizes: Array.isArray(data.prizes) ? data.prizes : [],
				meta: {
					title: data.title ?? null,
					totalPrizePool: Number(data.totalPrizePool) || 0,
					frequency: data.frequency ?? null,
					status: data.status ?? null,
				},
				period: data.period ?? null,
				loading: false,
			});
		} catch (err: unknown) {
			set({
				error: normalizeErrorMessage(err),
				loading: false,
				users: [],
				prizes: [],
				period: null,
			});
		}
	},
}));