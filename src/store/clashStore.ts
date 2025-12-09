import { create } from "zustand";
import axios from "axios";

interface Player {
  uid: string;
  name: string;
  wagered: number;
  deposits: number;
  wageredGems?: number;
  depositsGems?: number;
}

interface ClashState {
  players: Player[];
  loading: boolean;
  error: string | null;
  fetchLeaderboard: () => Promise<void>;
}

export const useClashStore = create<ClashState>((set) => ({
  players: [],
  loading: false,
  error: null,

  fetchLeaderboard: async () => {
    set({ loading: true, error: null });

    try {
      // Base start date
      const baseDate = new Date("2025-12-07");

      // Current date
      const today = new Date();

      // Difference in days
      const diffDays = Math.floor((today.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate how many 14-day intervals have passed
      const intervals = Math.floor(diffDays / 14);

      // Calculate the new start date based on intervals
      const sinceDate = new Date(baseDate.getTime() + intervals * 14 * 24 * 60 * 60 * 1000);

      // Format as YYYY-MM-DD
      const formattedDate = sinceDate.toISOString().split("T")[0];

      const response = await axios.get(
        `https://misterteedata-production.up.railway.app/api/leaderboard/clash/${formattedDate}`
      );

      const data = response.data;

      const players = data.map((player: Player) => ({
        ...player,
        wageredGems: player.wagered / 100,
      }));

      set({ players, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch leaderboard", loading: false });
    }
  },
}));
