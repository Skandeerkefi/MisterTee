import { create } from "zustand";

interface PackdrawEntry {
  username: string;
  wagerAmount: number;
  image?: string;
  userId?: string;
  isActive?: boolean;
}

interface PackdrawState {
  monthlyData: PackdrawEntry[];
  loading: boolean;
  error: string | null;
  fetchMonthly: (month: string, year: string) => Promise<void>;
}

// Utility to get correct month start
function getMonthStart(month: string, year: string) {
  return `${year}-${month}-01T00:00:00.000Z`;
}

export const usePackdrawStore = create<PackdrawState>((set) => ({
  monthlyData: [],
  loading: false,
  error: null,

  fetchMonthly: async (month: string, year: string) => {
    try {
      set({ loading: true, error: null });

      const start = getMonthStart(month, year);

      const res = await fetch(
        `https://misterteedata-production.up.railway.app/api/packdraw?after=${start}`
      );

      const data = await res.json();

      // API RETURNS: { leaderboard: [...] }
      set({
        monthlyData: data.leaderboard || [],
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch data",
        loading: false,
      });
    }
  },
}));
