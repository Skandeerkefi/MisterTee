import { create } from "zustand";
import { getApiBaseUrl } from "@/lib/apiBase";

interface PointsProfile {
  balance: number;
  lifetimePoints: number;
  lastDailyLogin: string | null;
  loginStreak: number;
  recentTransactions: any[];
}

interface PointsState {
  profile: PointsProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  claimDailyLogin: () => Promise<{ success: boolean; bonusPoints?: number; error?: string }>;
  fetchTransactions: (limit?: number, skip?: number) => Promise<any[]>;
}

export const usePointsStore = create<PointsState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/points/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      set({ profile: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  claimDailyLogin: async () => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Not logged in" };
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/points/daily-login`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      await get().fetchProfile();
      return { success: true, bonusPoints: data.bonusPoints };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  fetchTransactions: async (limit = 50, skip = 0) => {
    const token = localStorage.getItem("token");
    if (!token) return [];
    const res = await fetch(`${getApiBaseUrl()}/api/points/transactions?limit=${limit}&skip=${skip}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.transactions || [];
  },

}));