import { useEffect } from "react";
import { useCSGOLeadStore } from "@/store/csgoleadStore";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const prizeMap: Record<number, string> = {
	1: "125 C 🥇",
	2: "55 C 🥈",
	3: "25 C 🥉",
	4: "15 C",
	5: "10 C",
	6: "10 C",
	7: "1 C",
};

// 🗓️ Helper to get current week range (Sunday → Saturday)
function getCurrentWeekRange() {
	const now = new Date();

	const day = now.getDay(); // 0 = Sunday
	const diffToSunday = -day;
	const sunday = new Date(now);
	sunday.setDate(now.getDate() + diffToSunday);
	sunday.setHours(0, 0, 0, 0);

	const saturday = new Date(sunday);
	saturday.setDate(sunday.getDate() + 6);
	saturday.setHours(23, 59, 59, 999);

	return { startOfWeek: sunday, endOfWeek: saturday };
}

const CSGOLeadPage = () => {
	const { leaderboard, loading, error, fetchLeaderboard } = useCSGOLeadStore();

	// Fetch leaderboard on mount
	useEffect(() => {
		fetchLeaderboard(10, 0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { startOfWeek, endOfWeek } = getCurrentWeekRange();

	return (
		<div className='relative flex flex-col min-h-screen text-white bg-black'>
			<GraphicalBackground />
			<Navbar />

			<main className='container flex-grow p-4 mx-auto'>
				<h1 className='mb-4 text-5xl font-extrabold text-center text-red-500 drop-shadow-lg'>
					🔥 CSGOWin Weekly Leaderboard 🔥
				</h1>

				{/* 🗓️ Show current week range */}
				<p className='text-center text-gray-400 mb-6'>
					Week:{" "}
					<span className='text-red-400'>
						{startOfWeek.toLocaleDateString()} → {endOfWeek.toLocaleDateString()}
					</span>
				</p>

				{/* 💰 Prize pool info */}
				<div className='mt-2 text-center text-gray-400'>
					<p className='text-lg font-semibold text-red-400'>
						Total Prize Pool: 250 C 💰
					</p>
					<p>
						Use code <span className='font-bold text-white'>"MisterTee"</span> to
						participate!
					</p>
				</div>

				{/* Status messages */}
				{loading && (
					<p className='mt-10 text-center text-gray-400'>Loading...</p>
				)}
				{error && <p className='mt-10 text-center text-red-500'>{error}</p>}

				{/* 🏆 Leaderboard table */}
				{!loading && !error && leaderboard.length > 0 && (
					<div className='mt-8 overflow-x-auto'>
						<table className='min-w-full text-sm bg-gray-900 border border-red-600 shadow-xl rounded-2xl'>
							<thead className='text-white bg-gradient-to-r from-red-700 to-black'>
								<tr>
									<th className='p-3 text-left uppercase'>#</th>
									<th className='p-3 text-left uppercase'>Name</th>
									<th className='p-3 text-left uppercase'>Wagered</th>
									<th className='p-3 text-left uppercase'>Deposited</th>
									<th className='p-3 text-left uppercase'>Prize</th>
								</tr>
							</thead>

							<tbody>
								{leaderboard.map((entry, index) => {
									const rank = index + 1;
									return (
										<tr
											key={index}
											className={`transition-all ${
												rank <= 3
													? "bg-red-800/60 hover:bg-red-700"
													: rank % 2 === 0
													? "bg-gray-800"
													: "bg-gray-900"
											} hover:text-white`}
										>
											<td className='p-3 font-bold text-red-500'>#{rank}</td>
											<td className='p-3 font-medium'>{entry.name}</td>
											<td className='p-3 font-semibold text-red-400'>
												{entry.wagered.toLocaleString()}
											</td>
											<td className='p-3 font-semibold text-green-400'>
												{entry.deposited.toLocaleString()}
											</td>
											<td className='p-3 font-semibold text-yellow-400'>
												{prizeMap[rank] || "—"}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}

				{/* 🚫 No data fallback */}
				{!loading && !error && leaderboard.length === 0 && (
					<p className='mt-10 text-center text-gray-500'>
						No leaderboard data available for this week.
					</p>
				)}
			</main>

			<Footer />
		</div>
	);
};

export default CSGOLeadPage;
