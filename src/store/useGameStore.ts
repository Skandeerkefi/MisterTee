import { create } from "zustand";
import { getApiBaseUrl } from "@/lib/apiBase";

interface GameConfig {
  minWager: number;
  maxWager: number;
  dailyLossCap: number;
  active: boolean;
}

interface GameRound {
  _id: string;
  game: string;
  wager: number;
  payout: number;
  outcome: string;
  multiplier: number;
  playedAt: string;
  meta: any;
}

interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  totalWagered: number;
  totalPayout: number;
  winRate: string;
}

interface GameState {
  config: GameConfig | null;
  history: GameRound[];
  stats: GameStats | null;
  isPlaying: boolean;
  error: string | null;
  fetchConfig: (gameType: string) => Promise<void>;
  playCoinFlip: (wager: number, chosenSide: "heads" | "tails") => Promise<any>;
  playBlackjack: (wager: number) => Promise<any>;
  playMines: (wager: number, mines: number) => Promise<any>;
  playTower: (wager: number, floors: number) => Promise<any>;
  fetchHistory: (gameType?: string) => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  config: null,
  history: [],
  stats: null,
  isPlaying: false,
  error: null,

  fetchConfig: async (gameType) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(`${getApiBaseUrl()}/api/games/config/${gameType}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      set({ config: data });
    }
  },

  playCoinFlip: async (wager, chosenSide) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Not logged in" };
    set({ isPlaying: true, error: null });
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/games/coinflip`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ wager, chosenSide }),
      });
      const data = await res.json();
      set({ isPlaying: false });
      if (!res.ok) return { success: false, error: data.error };
      await get().fetchHistory("coinflip");
      return { success: true, ...data };
    } catch (error: any) {
      set({ isPlaying: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  playBlackjack: async (wager) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Not logged in" };
    set({ isPlaying: true, error: null });
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/games/blackjack`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ wager }),
      });
      const data = await res.json();
      set({ isPlaying: false });
      if (!res.ok) return { success: false, error: data.error };
      await get().fetchHistory("blackjack");
      return { success: true, ...data };
    } catch (error: any) {
      set({ isPlaying: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  playMines: async (wager, mines) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Not logged in" };
    set({ isPlaying: true, error: null });
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/games/mines`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ wager, mines }),
      });
      const data = await res.json();
      set({ isPlaying: false });
      if (!res.ok) return { success: false, error: data.error };
      await get().fetchHistory("mines");
      return { success: true, ...data };
    } catch (error: any) {
      set({ isPlaying: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  playTower: async (wager, floors) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Not logged in" };
    set({ isPlaying: true, error: null });
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/games/tower`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ wager, floors }),
      });
      const data = await res.json();
      set({ isPlaying: false });
      if (!res.ok) return { success: false, error: data.error };
      await get().fetchHistory("tower");
      return { success: true, ...data };
    } catch (error: any) {
      set({ isPlaying: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  fetchHistory: async (gameType) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const params = gameType ? `?gameType=${gameType}` : "";
    const res = await fetch(`${getApiBaseUrl()}/api/games/history${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      set({ history: data.games || [] });
    }
  },

  fetchStats: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(`${getApiBaseUrl()}/api/games/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      set({ stats: data });
    }
  },
}));