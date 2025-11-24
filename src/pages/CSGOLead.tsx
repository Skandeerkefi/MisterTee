import { useEffect, useState } from "react";
import { useCSGOLeadStore } from "@/store/csgoleadStore";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";

dayjs.extend(duration);
dayjs.extend(utc);

const CSGOLeadPage = () => {
	const { leaderboard, loading, error, fetchLeaderboard } = useCSGOLeadStore();
	const [timeLeft, setTimeLeft] = useState("");
	const [dateRange, setDateRange] = useState({ start: "", end: "" });

	useEffect(() => {
		const fetchData = async () => {
			// fetch leaderboard via store
			await fetchLeaderboard(10);

			// fetch active leaderboard to get date range
			const res = await fetch(
				`https://misterteedata-production.up.railway.app/api/leaderboard/csgowin`
			);
			const data = await res.json();
			const activeLB = data.leaderboards?.find((lb: any) => lb.active);
			if (activeLB) {
				setDateRange({
					start: dayjs.utc(activeLB.dateStart).format("D MMM"),
					end: dayjs.utc(activeLB.dateEnd).format("D MMM"),
				});
			}
		};

		fetchData();
	}, [fetchLeaderboard]);

	// countdown to active leaderboard end
	useEffect(() => {
		const interval = setInterval(async () => {
			const res = await fetch(
				`https://misterteedata-production.up.railway.app/api/leaderboard/csgowin`
			);
			const data = await res.json();
			const activeLB = data.leaderboards?.find((lb: any) => lb.active);
			if (!activeLB) return;

			const end = dayjs.utc(activeLB.dateEnd);
			const now = dayjs.utc();
			const diff = end.diff(now);

			if (diff <= 0) {
				setTimeLeft("Leaderboard resetting...");
			} else {
				const d = dayjs.duration(diff);
				setTimeLeft(
					`${Math.floor(d.asDays())}d ${d.hours()}h ${d.minutes()}m ${d.seconds()}s`
				);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="relative flex flex-col min-h-screen text-white bg-black">
			<GraphicalBackground />
			<Navbar />

			<main className="container flex-grow p-4 mx-auto">
				<h1 className="mb-4 text-5xl font-extrabold text-center text-red-500 drop-shadow-lg">
					🔥 CSGOWin 1K Leaderboard 🔥
				</h1>

				<p className="text-center text-gray-400 mb-2">
					Range:{" "}
					<span className="text-red-400">{`${dateRange.start} → ${dateRange.end}`}</span>
				</p>

				<p className="text-center text-md font-semibold text-gray-300 mb-6">
					⏳ Next Reset In:{" "}
					<span className="text-yellow-400 font-bold">{timeLeft}</span>
				</p>

				<div className="mt-2 text-center text-gray-400">
					<p className="text-lg font-semibold text-red-400">
						Total Prize Pool: {leaderboard.reduce((acc, u) => acc + u.prize, 0).toLocaleString()} C 💰
					</p>
					<p>
						Use code <span className="font-bold text-white">"MisterTee"</span>{" "}
						to participate!
					</p>
				</div>

				{loading && <p className="mt-10 text-center text-gray-400">Loading...</p>}
				{error && <p className="mt-10 text-center text-red-500">{error}</p>}

				{!loading && !error && leaderboard.length > 0 && (
					<div className="mt-8 overflow-x-auto">
						<table className="min-w-full text-sm bg-gray-900 border border-red-600 shadow-xl rounded-2xl">
							<thead className="text-white bg-gradient-to-r from-red-700 to-black">
								<tr>
									<th className="p-3 text-left uppercase">#</th>
									<th className="p-3 text-left uppercase">Name</th>
									<th className="p-3 text-left uppercase">Wagered</th>
									<th className="p-3 text-left uppercase">Prize</th>
								</tr>
							</thead>

							<tbody>
								{leaderboard.map((entry) => (
									<tr
										key={entry.rank}
										className={`transition-all ${
											entry.rank <= 3
												? "bg-red-800/60 hover:bg-red-700"
												: entry.rank % 2 === 0
												? "bg-gray-800"
												: "bg-gray-900"
										} hover:text-white`}
									>
										<td className="p-3 font-bold text-red-500">#{entry.rank}</td>
										<td className="p-3 font-medium">{entry.name}</td>
										<td className="p-3 font-semibold text-red-400">
											{entry.wagered.toLocaleString()}
										</td>
										<td className="p-3 font-semibold text-yellow-400">
											{entry.prize.toLocaleString()} C
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{!loading && !error && leaderboard.length === 0 && (
					<p className="mt-10 text-center text-gray-500">
						No leaderboard data available for this period.
					</p>
				)}
			</main>

			<Footer />
		</div>
	);
};

export default CSGOLeadPage;
