import { create } from "zustand";
import axios from "axios";

interface Player {
  uid: string;
  username: string;
  wagered: number;
  deposits: number;
  wageredGems?: number; // optional converted field
  depositsGems?: number;
}

interface ClashState {
  players: Player[];
  loading: boolean;
  error: string | null;
  fetchLeaderboard: (sinceDate: string) => Promise<void>;
}

export const useClashStore = create<ClashState>((set) => ({
  players: [],
  loading: false,
  error: null,

  fetchLeaderboard: async (sinceDate: string) => {
    set({ loading: true, error: null });

    try {
      const response = await axios.get(`https://misterteedata-production.up.railway.app/api/leaderboard/clash/${sinceDate}`);
      const data = response.data;

      // Optional: convert gem cents to gems
      const players = data.players?.map((player: Player) => ({
        ...player,
        wageredGems: player.wagered / 100,
        depositsGems: player.deposits / 100,
      })) || [];

      set({ players, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch leaderboard", loading: false });
    }
  },
}));
