import { makeAutoObservable, runInAction } from "mobx";

export interface LeaderboardPlayer {
	uid: string;
	username: string;
	wagered: number;
	weightedWagered: number;
	favoriteGameId: string;
	favoriteGameTitle: string;
}

export interface LeaderboardResponse {
	disclosure: string;
	data: LeaderboardPlayer[];
}

export interface ApiError {
	error: string;
	details?: any;
}

class RoobetStore {
	leaderboard: LeaderboardPlayer[] = [];
	isLoading: boolean = false;
	error: ApiError | null = null;
	disclosure: string = "";

	constructor() {
		makeAutoObservable(this);
	}

	// Always fetch monthly leaderboard
	async fetchLeaderboard(): Promise<void> {
		this.isLoading = true;
		this.error = null;

		try {
			// Monthly leaderboard endpoint
			const url = "/api/leaderboard/monthly";

			const response = await fetch(url, {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			});

			if (!response.ok)
				throw new Error(`HTTP error! status: ${response.status}`);

			const data: LeaderboardResponse = await response.json();

			runInAction(() => {
				this.leaderboard = data.data;
				this.disclosure = data.disclosure;
				this.isLoading = false;
			});
		} catch (err) {
			runInAction(() => {
				this.error = {
					error: "Failed to fetch leaderboard",
					details: err instanceof Error ? err.message : "Unknown error",
				};
				this.isLoading = false;
			});
		}
	}

	get topPlayers(): LeaderboardPlayer[] {
		return this.leaderboard.slice(0, 10);
	}

	getPlayerByRank(rank: number): LeaderboardPlayer | null {
		return this.leaderboard[rank - 1] || null;
	}

	searchPlayers(query: string): LeaderboardPlayer[] {
		const searchTerm = query.toLowerCase();
		return this.leaderboard.filter((player) =>
			player.username.toLowerCase().includes(searchTerm)
		);
	}

	get totalWeightedWagered(): number {
		return this.leaderboard.reduce(
			(total, player) => total + player.weightedWagered,
			0
		);
	}

	get averageWeightedWager(): number {
		if (this.leaderboard.length === 0) return 0;
		return this.totalWeightedWagered / this.leaderboard.length;
	}

	clearError(): void {
		this.error = null;
	}

	reset(): void {
		this.leaderboard = [];
		this.isLoading = false;
		this.error = null;
		this.disclosure = "";
	}
}

export const roobetStore = new RoobetStore();
export default roobetStore;
