import { create } from "zustand";
import api from "@/lib/api";

interface PackdrawEntry {
  username: string;
  wagered: number;
  deposited: number;
  createdAt: string;
}

interface PackdrawState {
  monthlyData: PackdrawEntry[];
  loading: boolean;
  error: string | null;
  fetchMonthly: (month: string, year: string) => Promise<void>;
}

// Utility to get month range
function getMonthRange(month: string, year: string) {
  const start = `${year}-${month}-01`;
  const end = `${year}-${month}-31`;
  return { start, end };
}

export const usePackdrawStore = create<PackdrawState>((set) => ({
  monthlyData: [],
  loading: false,
  error: null,

  fetchMonthly: async (month: string, year: string) => {
    try {
      set({ loading: true, error: null });

      const { start } = getMonthRange(month, year);

      const res = await fetch(
    `https://misterteedata-production.up.railway.app/api/packdraw?after=${start}`
);

      const data = await res.json();

      set({ monthlyData: data || [], loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch data", loading: false });
    }
  },
}));
