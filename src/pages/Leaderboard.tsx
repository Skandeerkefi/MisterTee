import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { roobetStore } from "../store/RoobetStore";
import {
	formatCurrency,
	formatLargeNumber,
	getRtpClass,
} from "../store/RoobetUtils";

const Leaderboard: React.FC = observer(() => {
	const { leaderboard, isLoading, error, disclosure } = roobetStore;
	const [dateRange, setDateRange] = useState({ start: "", end: "" });

	const handleDateFilter = () => {
		if (dateRange.start && dateRange.end) {
			roobetStore.fetchLeaderboard(dateRange.start, dateRange.end);
		}
	};

	const handleClearFilter = () => {
		setDateRange({ start: "", end: "" });
		roobetStore.fetchLeaderboard();
	};

	if (isLoading) {
		return <div className='loading'>Loading leaderboard...</div>;
	}

	if (error) {
		return (
			<div className='error'>
				<h3>Error</h3>
				<p>{error.error}</p>
				<button onClick={() => roobetStore.fetchLeaderboard()}>Retry</button>
			</div>
		);
	}

	return (
		<div className='leaderboard-container'>
			<h1>Roobet Leaderboard</h1>

			{/* Date Filter */}
			<div className='date-filter'>
				<input
					type='date'
					value={dateRange.start}
					onChange={(e) =>
						setDateRange({ ...dateRange, start: e.target.value })
					}
					placeholder='Start Date'
				/>
				<input
					type='date'
					value={dateRange.end}
					onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
					placeholder='End Date'
				/>
				<button onClick={handleDateFilter}>Apply Filter</button>
				<button onClick={handleClearFilter}>Clear Filter</button>
			</div>

			{/* Disclosure */}
			<div className='disclosure'>
				<h3>Important Information</h3>
				<p>{disclosure}</p>
			</div>

			{/* Leaderboard Table */}
			<table className='leaderboard-table'>
				<thead>
					<tr>
						<th>Rank</th>
						<th>Player</th>
						<th>Total Wagered</th>
						<th>Weighted Wagered</th>
						<th>Favorite Game</th>
					</tr>
				</thead>
				<tbody>
					{leaderboard.map((player, index) => (
						<tr key={player.uid}>
							<td>{index + 1}</td>
							<td>{player.username}</td>
							<td>{formatCurrency(player.wagered)}</td>
							<td
								className={getRtpClass(player.weightedWagered, player.wagered)}
							>
								{formatCurrency(player.weightedWagered)}
							</td>
							<td>{player.favoriteGameTitle}</td>
						</tr>
					))}
				</tbody>
			</table>

			{leaderboard.length === 0 && !isLoading && (
				<div className='no-data'>No leaderboard data available</div>
			)}
		</div>
	);
});

export default Leaderboard;
