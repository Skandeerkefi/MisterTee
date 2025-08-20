import { useEffect } from "react";
import { roobetStore } from "./RoobetStore";
import { useInterval } from "./useInterval"; // Optional: for auto-refresh

// Hook to use RoobetStore in React components
export const useRoobetStore = (
	autoRefresh: boolean = false,
	refreshInterval: number = 30000
) => {
	useEffect(() => {
		roobetStore.fetchLeaderboard(); // monthly by default
	}, []);

	useInterval(() => {
		if (autoRefresh) roobetStore.fetchLeaderboard();
	}, refreshInterval);

	return roobetStore;
};
