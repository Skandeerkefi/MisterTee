import { LeaderboardPlayer } from "./RoobetStore";

// Format currency values
export const formatCurrency = (amount: number): string => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
};

// Format large numbers
export const formatLargeNumber = (num: number): string => {
	if (num >= 1000000) {
		return (num / 1000000).toFixed(2) + "M";
	}
	if (num >= 1000) {
		return (num / 1000).toFixed(2) + "K";
	}
	return num.toString();
};

// Get RTP class for styling
export const getRtpClass = (
	weightedWagered: number,
	originalWagered: number
): string => {
	const percentage = (weightedWagered / originalWagered) * 100;

	if (percentage >= 100) return "rtp-high";
	if (percentage >= 50) return "rtp-medium";
	return "rtp-low";
};

// Sort players by various criteria
export const sortPlayers = (
	players: LeaderboardPlayer[],
	sortBy: "wagered" | "weightedWagered" | "username" = "weightedWagered",
	ascending: boolean = false
): LeaderboardPlayer[] => {
	return [...players].sort((a, b) => {
		let comparison = 0;

		switch (sortBy) {
			case "wagered":
				comparison = a.wagered - b.wagered;
				break;
			case "weightedWagered":
				comparison = a.weightedWagered - b.weightedWagered;
				break;
			case "username":
				comparison = a.username.localeCompare(b.username);
				break;
		}

		return ascending ? comparison : -comparison;
	});
};

// Filter players by minimum wager amount
export const filterByMinimumWager = (
	players: LeaderboardPlayer[],
	minWager: number
): LeaderboardPlayer[] => {
	return players.filter((player) => player.weightedWagered >= minWager);
};

// Calculate player rank
export const calculateRank = (
	players: LeaderboardPlayer[],
	playerId: string
): number => {
	const sorted = sortPlayers(players, "weightedWagered");
	return sorted.findIndex((player) => player.uid === playerId) + 1;
};
