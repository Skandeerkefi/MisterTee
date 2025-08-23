import { useEffect, useState } from "react";
import { useRainStore } from "../store/rainStore";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function RainPage() {
	const { leaderboard, loading, error, fetchLeaderboard } = useRainStore();
	const [monthOffset, setMonthOffset] = useState(0);

	useEffect(() => {
		const fetchMonthlyLeaderboard = async () => {
			const now = new Date();
			const startMonth = new Date(
				now.getFullYear(),
				now.getMonth() + monthOffset,
				1
			);
			const endMonth = new Date(
				now.getFullYear(),
				now.getMonth() + monthOffset + 1,
				0
			);

			await fetchLeaderboard(
				startMonth.toISOString(),
				endMonth.toISOString(),
				"wagered"
			);
		};
		fetchMonthlyLeaderboard();
	}, [monthOffset, fetchLeaderboard]);

	const handlePrevMonth = () => setMonthOffset((prev) => prev - 1);
	const handleNextMonth = () => setMonthOffset((prev) => prev + 1);

	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const now = new Date();
	const displayMonth = new Date(
		now.getFullYear(),
		now.getMonth() + monthOffset,
		1
	);
	const monthName =
		monthNames[displayMonth.getMonth()] + " " + displayMonth.getFullYear();

	return (
		<div className='relative flex flex-col min-h-screen text-white '>
			<GraphicalBackground />

			<Navbar />

			<main className='relative z-10 flex-1 w-full max-w-6xl p-6 mx-auto'>
				<h1 className='mb-2 text-3xl font-bold text-center'>
					🌧 Rain.gg Leaderboard
				</h1>
				<h2 className='mb-6 text-xl text-center text-yellow-400'>
					{monthName}
				</h2>

				<div className='flex justify-center gap-4 mb-6'>
					<button
						onClick={handlePrevMonth}
						className='px-5 py-2 transition bg-red-600 rounded hover:bg-red-700'
					>
						Previous Month
					</button>
					<button
						onClick={handleNextMonth}
						className='px-5 py-2 text-black transition bg-yellow-400 rounded hover:bg-yellow-500'
					>
						Next Month
					</button>
				</div>

				{loading && <p className='text-center'>Loading...</p>}
				{error && <p className='text-center text-red-500'>Error: {error}</p>}

				{!loading && leaderboard.length > 0 && (
					<div className='overflow-x-auto border border-[#e10600] shadow-2xl rounded-xl bg-black'>
						<table className='w-full text-left border-collapse'>
							<thead className='bg-[#e10600] text-white'>
								<tr>
									<th className='p-4 border-b border-white'>Rank</th>
									<th className='p-4 border-b border-white'>User</th>
									<th className='p-4 border-b border-white'>Wagered</th>
								</tr>
							</thead>
							<tbody>
								{leaderboard.map((user, index) => (
									<tr
										key={user.id}
										className={`border-b border-white transition ${
											index % 2 === 0 ? "bg-black/70" : "bg-black/50"
										} hover:bg-[#e10600]/20`}
									>
										<td className='p-4 font-semibold text-white'>
											{index + 1}
										</td>
										<td className='flex items-center gap-3 p-4 text-white'>
											<img
												src={user.avatar || "https://via.placeholder.com/40"}
												alt={user.username}
												className='object-cover w-10 h-10 border border-white rounded-full'
											/>
											{user.username}
										</td>
										<td className='p-4 font-medium text-[#e10600]'>
											${Number(user.wagered || 0).toLocaleString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</main>

			<Footer className='relative z-10' />
		</div>
	);
}
