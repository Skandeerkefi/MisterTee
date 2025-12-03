import { create } from "zustand";
import axios from "axios";
import dayjs from "dayjs"; // lightweight date library (npm install dayjs)

import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
interface Player {
	uid: string;
	username: string;
	wagered: number;
	weightedWagered: number;
	favoriteGameId: string;
	favoriteGameTitle: string;
	rankLevel: number;
}

interface LeaderboardData {
	disclosure: string;
	data: Player[];
}

interface RoobetStore {
	leaderboard: LeaderboardData | null;
	loading: boolean;
	error: string | null;
	fetchLeaderboard: (startDate?: string, endDate?: string) => Promise<void>;
}

export const useRoobetStore = create<RoobetStore>((set) => ({
	leaderboard: null,
	loading: false,
	error: null,

	fetchLeaderboard: async (startDate?: string, endDate?: string) => {
		set({ loading: true, error: null });

		try {
			// If no startDate/endDate provided → use current month's range
			if (!startDate || !endDate) {
    const now = dayjs().utc(); // Use UTC time
    startDate = now.startOf("month").format("YYYY-MM-DD");
    endDate = now.endOf("month").format("YYYY-MM-DD");
}


			let url = `https://misterteedata-production.up.railway.app/api/leaderboard/${startDate}/${endDate}`;

			const response = await axios.get(url);

			const updatedData: LeaderboardData = {
				disclosure: response.data.disclosure,
				data: response.data.data.map((player: any, index: number) => ({
					uid: player.uid,
					username: player.username,
					wagered: player.wagered,
					weightedWagered: player.weightedWagered,
					favoriteGameId: player.favoriteGameId,
					favoriteGameTitle: player.favoriteGameTitle,
					rankLevel: index + 1,
				})),
			};

			set({ leaderboard: updatedData, loading: false });
		} catch (err: any) {
			set({
				error: err.response?.data?.error || "Failed to fetch leaderboard",
				loading: false,
			});
		}
	},
}));
