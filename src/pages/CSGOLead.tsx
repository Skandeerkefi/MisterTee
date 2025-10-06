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
	7: "10 C",
};

const CSGOLeadPage = () => {
	const { leaderboard, loading, error, fetchLeaderboard } = useCSGOLeadStore();

	useEffect(() => {
		fetchLeaderboard(10, 0);
	}, [fetchLeaderboard]);

	return (
		<div className='relative flex flex-col min-h-screen text-white bg-black'>
			<GraphicalBackground />
			<Navbar />

			<main className='container flex-grow p-4 mx-auto'>
				<h1 className='mb-8 text-5xl font-extrabold text-center text-red-500 drop-shadow-lg'>
					🔥 CSGOWin Weekly Leaderboard 🔥
				</h1>
				<div className='mt-8 text-center text-gray-400'>
					<p className='text-lg font-semibold text-red-400'>
						Total Prize Pool: 250 C 💰
					</p>
					<p>
						Use code <span className='font-bold text-white'>"MisterTee"</span>{" "}
						to participate!
					</p>
				</div>
				<br></br>

				{loading && <p className='text-center text-gray-400'>Loading...</p>}
				{error && <p className='text-center text-red-500'>{error}</p>}

				{!loading && !error && leaderboard.length > 0 && (
					<div className='overflow-x-auto'>
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
												{entry.wagered}
											</td>
											<td className='p-3 font-semibold text-green-400'>
												{entry.deposited}
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
			</main>

			<Footer />
		</div>
	);
};

export default CSGOLeadPage;
