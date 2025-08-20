import { useEffect } from "react";
import { roobetStore } from "./RoobetStore";
import { useInterval } from "./useInterval"; // Optional: for auto-refresh

// Custom hook to use RoobetStore in React components
export const useRoobetStore = (
	autoRefresh: boolean = false,
	refreshInterval: number = 30000
) => {
	// Fetch leaderboard on mount
	useEffect(() => {
		roobetStore.fetchLeaderboard();
	}, []);

	// Set up auto-refresh if enabled
	useInterval(() => {
		if (autoRefresh) {
			roobetStore.fetchLeaderboard();
		}
	}, refreshInterval);

	return roobetStore;
};

// Hook for date-filtered leaderboard
export const useDateFilteredLeaderboard = (
	startDate?: string,
	endDate?: string
) => {
	useEffect(() => {
		if (startDate && endDate) {
			roobetStore.fetchLeaderboard(startDate, endDate);
		}
	}, [startDate, endDate]);

	return roobetStore;
};
