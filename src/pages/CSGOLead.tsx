import { useEffect } from "react";
import { useCSGOLeadStore } from "@/store/csgoleadStore";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const CSGOLeadPage = () => {
	const { leaderboard, loading, error, fetchLeaderboard } = useCSGOLeadStore();

	useEffect(() => {
		fetchLeaderboard(10, 0);
	}, [fetchLeaderboard]);

	return (
		<div className='relative flex flex-col min-h-screen '>
			<GraphicalBackground />
			<Navbar />
			<main className='container flex-grow p-4 mx-auto'>
				<h1 className='mb-6 text-4xl font-extrabold text-center text-white'>
					CSGOWin Leaderboard
				</h1>

				{loading && <p className='text-center text-gray-500'>Loading...</p>}
				{error && <p className='text-center text-red-500'>{error}</p>}

				{!loading && !error && leaderboard.length > 0 && (
					<div className='overflow-x-auto'>
						<table className='min-w-full overflow-hidden bg-white rounded-lg shadow-md'>
							<thead className='text-white bg-gradient-to-r from-indigo-500 to-purple-500'>
								<tr>
									<th className='p-3 text-sm font-semibold text-left text-black uppercase'>
										#
									</th>
									<th className='p-3 text-sm font-semibold text-left uppercase'>
										Name
									</th>
									<th className='p-3 text-sm font-semibold text-left uppercase'>
										Wager
									</th>
									<th className='p-3 text-sm font-semibold text-left uppercase'>
										Deposited
									</th>
									<th className='p-3 text-sm font-semibold text-left uppercase'>
										Joined
									</th>
								</tr>
							</thead>
							<tbody>
								{leaderboard.map((entry, index) => (
									<tr
										key={index}
										className={`transition-all hover:bg-gray-100 ${
											index % 2 === 0 ? "bg-gray-50" : "bg-white"
										}`}
									>
										<td className='p-3'>{index + 1}</td>
										<td className='p-3 font-medium text-gray-700'>
											{entry.name}
										</td>
										<td className='p-3 font-semibold text-indigo-600'>
											{entry.wagered}
										</td>
										<td className='p-3 font-semibold text-green-600'>
											{entry.deposited}
										</td>
										<td className='p-3 text-gray-500'>
											{new Date(entry.createdAt).toLocaleDateString()}
										</td>
									</tr>
								))}
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
