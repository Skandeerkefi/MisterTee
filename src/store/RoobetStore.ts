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
	dateRange?: {
		startDate: string;
		endDate: string;
	};
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

	// Fetch leaderboard data
	async fetchLeaderboard(startDate?: string, endDate?: string): Promise<void> {
		this.isLoading = true;
		this.error = null;

		try {
			let url = "/api/leaderboard";

			if (startDate && endDate) {
				url = `/api/leaderboard/${startDate}/${endDate}`;
			} else if (startDate || endDate) {
				console.warn(
					"Both startDate and endDate must be provided for date filtering"
				);
			}

			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

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

	// Get top players
	get topPlayers(): LeaderboardPlayer[] {
		return this.leaderboard.slice(0, 10); // Top 10 players
	}

	// Get player by rank
	getPlayerByRank(rank: number): LeaderboardPlayer | null {
		return this.leaderboard[rank - 1] || null;
	}

	// Search players by username
	searchPlayers(query: string): LeaderboardPlayer[] {
		const searchTerm = query.toLowerCase();
		return this.leaderboard.filter((player) =>
			player.username.toLowerCase().includes(searchTerm)
		);
	}

	// Get total weighted wagered amount
	get totalWeightedWagered(): number {
		return this.leaderboard.reduce(
			(total, player) => total + player.weightedWagered,
			0
		);
	}

	// Get average weighted wager
	get averageWeightedWager(): number {
		if (this.leaderboard.length === 0) return 0;
		return this.totalWeightedWagered / this.leaderboard.length;
	}

	// Clear error
	clearError(): void {
		this.error = null;
	}

	// Reset store
	reset(): void {
		this.leaderboard = [];
		this.isLoading = false;
		this.error = null;
		this.disclosure = "";
	}
}

// Create and export singleton instance
export const roobetStore = new RoobetStore();
export default roobetStore;
