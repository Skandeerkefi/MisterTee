import { create } from "zustand";

interface LeaderboardEntry {
  rank: number;
  name: string;
  wagered: number;
  prize: number;
}

interface CSGOLeadState {
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  dateStart: string;
  dateEnd: string;
  fetchLeaderboard: (take?: number) => Promise<void>;
}

export const useCSGOLeadStore = create<CSGOLeadState>((set) => ({
  leaderboard: [],
  loading: false,
  error: null,
  dateStart: "",
  dateEnd: "",

  fetchLeaderboard: async (take = 10) => {
    set({ loading: true, error: null });

    try {
      const res = await fetch(
        `https://misterteedata-production.up.railway.app/api/leaderboard/csgowin`
      );

      if (!res.ok) throw new Error("Failed to fetch leaderboard");

      const data = await res.json();

      // Pick active leaderboard with users OR fallback to latest with users
      const lb =
        data.leaderboards?.find((l: any) => l.active && l.users?.length > 0) ||
        data.leaderboards?.find((l: any) => l.users?.length > 0);

      if (!lb) throw new Error("No leaderboard with users found");

      const users = lb.users || [];
      const prizes = lb.prizes || [];

      const mapped: LeaderboardEntry[] = users.map((u: any, idx: number) => ({
        rank: u.rank || idx + 1,
        name: u.username || u.name || "Unknown",
        wagered: u.wagered || 0,
        prize: prizes[idx] || 0,
      }));

      set({
        leaderboard: mapped.slice(0, take),
        loading: false,
        dateStart: lb.dateStart,
        dateEnd: lb.dateEnd,
      });
    } catch (err: any) {
      set({ error: err.message || "Unknown error", loading: false });
    }
  },
}));
