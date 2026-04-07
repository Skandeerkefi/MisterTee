import { create } from "zustand";
import axios from "axios";

export type DiamondEntry = {
	username?: string;
	name?: string;
	user?: string;
	amount?: number;
	wagered?: number;
	referrals?: number;
	count?: number;
	totalAmount?: string | number;
	prize?: number;
	avatar?: string;
	isAnon?: boolean;
	[key: string]: unknown;
};

type DiamondsApiResponse =
	| DiamondEntry[]
	| {
		leaderboard?: DiamondEntry[];
		data?: DiamondEntry[];
		players?: DiamondEntry[];
		results?: DiamondEntry[];
		start?: string;
		end?: string;
		[key: string]: unknown;
	};

const BACKEND_URL = "https://misterteedata-production.up.railway.app/api/leaderboard/diamonds";

function normalizeErrorMessage(error: unknown) {
	if (typeof error === "string") return error;
	if (error && typeof error === "object") {
		const maybeMessage = error as { error?: unknown; message?: unknown };
		if (typeof maybeMessage.error === "string") return maybeMessage.error;
		if (typeof maybeMessage.message === "string") return maybeMessage.message;
		return JSON.stringify(error);
	}
	return "Failed to fetch Diamonds leaderboard";
}

function normalizeDiamondEntries(payload: DiamondsApiResponse): DiamondEntry[] {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload.leaderboard)) return payload.leaderboard;
	if (Array.isArray(payload.data)) return payload.data;
	if (Array.isArray(payload.players)) return payload.players;
	if (Array.isArray(payload.results)) return payload.results;
	return [];
}

function getDisplayAmount(entry: DiamondEntry) {
	const rawValue =
		typeof entry.wagered === "number"
			? entry.wagered
			: typeof entry.amount === "number"
				? entry.amount
				: typeof entry.referrals === "number"
					? entry.referrals
					: typeof entry.count === "number"
						? entry.count
						: typeof entry.totalAmount === "string"
							? parseFloat(entry.totalAmount)
							: typeof entry.totalAmount === "number"
								? entry.totalAmount
								: 0;

	return Number(rawValue);
}

export function getDiamondDisplayName(entry: DiamondEntry) {
	return String(entry.username || entry.name || entry.user || "Unknown").trim() || "Unknown";
}

export function getDiamondDisplayValue(entry: DiamondEntry) {
	return getDisplayAmount(entry);
}

function getCurrentBiweeklyPeriod() {
	const now = new Date();
	const utcDay = now.getUTCDay();
	const daysSinceMonday = (utcDay + 6) % 7;
	const start = new Date(Date.UTC(
		now.getUTCFullYear(),
		now.getUTCMonth(),
		now.getUTCDate() - daysSinceMonday,
		0,
		0,
		0,
		0
	));
	const end = new Date(start);
	end.setUTCDate(end.getUTCDate() + 13);

	return { start, end };
}

export type DiamondPeriod = {
	start: Date;
	end: Date;
};

type DiamondStore = {
	leaderboard: DiamondEntry[];
	loading: boolean;
	error: string | null;
	period: DiamondPeriod;
	fetchLeaderboard: (period?: DiamondPeriod) => Promise<void>;
	reset: () => void;
};

export const useDiamondStore = create<DiamondStore>((set, get) => ({
	leaderboard: [],
	loading: false,
	error: null,
	period: getCurrentBiweeklyPeriod(),

	fetchLeaderboard: async (period) => {
		const nextPeriod = period ?? get().period;

		set({ loading: true, error: null, period: nextPeriod });

		try {
			const response = await axios.post(BACKEND_URL, {
				before: nextPeriod.end.getTime(),
				after: nextPeriod.start.getTime(),
			});

			set({
				leaderboard: normalizeDiamondEntries(response.data),
				loading: false,
			});
		} catch (err: unknown) {
			const axiosError = err as {
				response?: { data?: unknown };
				message?: unknown;
			};

			set({
				error: normalizeErrorMessage(
					axiosError.response?.data ?? axiosError.message
				),
				loading: false,
				leaderboard: [],
			});
		}
	},

	reset: () =>
		set({
			leaderboard: [],
			loading: false,
			error: null,
			period: getCurrentBiweeklyPeriod(),
		}),
}));