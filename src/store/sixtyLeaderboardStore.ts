import { create } from "zustand";
import api from "@/lib/api";
import axios from "axios";

export interface SixtyUser {
  id: number | null;
  userId: number | null;
  username: string;
  avatar: string | null;
  wager: number;
  rank: number;
}

export interface SixtyPrize {
  place: number;
  amount: number;
}

export interface SixtyPeriod {
  from: string | null;
  to: string | null;
}

interface SixtyLeaderboardMeta {
  title: string | null;
  totalPrizePool: number;
  frequency: string | null;
  status: string | null;
}

interface SixtyResponse {
  users: SixtyUser[];
  prizes: SixtyPrize[];
  title: string | null;
  totalPrizePool: number;
  frequency: string | null;
  status: string | null;
  period: SixtyPeriod | null;
}

interface SixtyLeaderboardState {
  users: SixtyUser[];
  prizes: SixtyPrize[];
  meta: SixtyLeaderboardMeta;
  period: SixtyPeriod | null;
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
    return error.message || "Failed to load Sixty.gg leaderboard";
  }
  if (error instanceof Error) return error.message;
  return "Failed to load Sixty.gg leaderboard";
}

export const useSixtyLeaderboardStore = create<SixtyLeaderboardState>((set) => ({
  users: [],
  prizes: [],
  meta: { title: null, totalPrizePool: 0, frequency: null, status: null },
  period: null,
  loading: false,
  error: null,

  fetchLeaderboard: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<SixtyResponse>("/api/leaderboard/sixty");

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