import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { roobetStore } from "../store/RoobetStore";
import { formatCurrency, getRtpClass } from "../store/RoobetUtils";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import GraphicalBackground from "@/components/GraphicalBackground"; // Import your background

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
	// Utility function to blur username
	const blurUsername = (username: string) => {
		if (!username) return "";
		const visible = username.slice(0, 3);
		const hidden = "*".repeat(Math.max(username.length - 3, 3));
		return visible + hidden;
	};
	return (
		<div className='relative flex flex-col min-h-screen text-white'>
			{/* Graphical Background */}
			<GraphicalBackground />

			{/* Navbar */}
			<Navbar />

			{/* Main Content */}
			<main className='relative z-10 flex-grow w-full max-w-6xl p-6 mx-auto'>
				<h1 className='mb-6 text-3xl font-bold'>Roobet Leaderboard</h1>

				{/* Date Filter */}
				<div className='flex flex-wrap gap-2 mb-6'>
					<input
						type='date'
						value={dateRange.start}
						onChange={(e) =>
							setDateRange({ ...dateRange, start: e.target.value })
						}
						className='px-3 py-2 rounded-lg bg-[#191F3B] text-white border border-[#AF2D03]'
					/>
					<input
						type='date'
						value={dateRange.end}
						onChange={(e) =>
							setDateRange({ ...dateRange, end: e.target.value })
						}
						className='px-3 py-2 rounded-lg bg-[#191F3B] text-white border border-[#AF2D03]'
					/>
					<button
						onClick={handleDateFilter}
						className='px-4 py-2 bg-[#AF2D03] text-white rounded-lg hover:bg-[#EA6D0C] transition'
					>
						Apply Filter
					</button>
					<button
						onClick={handleClearFilter}
						className='px-4 py-2 bg-[#191F3B] border border-[#AF2D03] text-white rounded-lg hover:bg-[#EA6D0C] transition'
					>
						Clear Filter
					</button>
				</div>

				{/* Disclosure */}
				{disclosure && (
					<div className='bg-[#191F3B]/70 p-4 rounded-xl mb-6 border-l-4 border-[#AF2D03]'>
						<h3 className='mb-1 font-semibold'>Important Information</h3>
						<p>{disclosure}</p>
					</div>
				)}

				{/* Error Handling */}
				{error && (
					<div className='bg-[#191F3B] p-6 rounded-xl shadow-lg text-center mb-6'>
						<h3 className='mb-2 text-2xl font-semibold'>Error</h3>
						<p className='mb-4'>{error.error}</p>
						<button
							onClick={() => roobetStore.fetchLeaderboard()}
							className='px-4 py-2 bg-[#AF2D03] rounded-xl hover:bg-[#EA6D0C] transition'
						>
							Retry
						</button>
					</div>
				)}

				{/* Loading */}
				{isLoading && (
					<div className='py-10 text-center'>Loading leaderboard...</div>
				)}

				{/* Leaderboard Table */}
				{!isLoading && leaderboard.length > 0 && (
					<div className='overflow-x-auto rounded-2xl border-4 border-[#AF2D03] shadow-[0_0_12px_#AF2D03] bg-[#0d111c]'>
						<div className='bg-black/50 backdrop-blur-sm'>
							<table className='min-w-full'>
								<thead>
									<tr className='bg-[#AF2D03]/20 border-b border-white'>
										<th className='py-3 pl-6 text-left text-[#FF4A00] font-semibold tracking-wide'>
											Rank
										</th>
										<th className='py-3 pl-6 font-semibold tracking-wide text-left text-white'>
											Player
										</th>
										<th className='py-3 pr-6 text-right text-[#FF4A00] font-semibold tracking-wide'>
											Total Wagered
										</th>
										<th className='py-3 pr-6 text-right text-[#FF4A00] font-semibold tracking-wide'>
											Weighted Wagered
										</th>
										<th className='py-3 pl-6 font-semibold tracking-wide text-left text-white'>
											Favorite Game
										</th>
									</tr>
								</thead>
								<tbody>
									{leaderboard.map((player, index) => {
										const isTop3 = index < 3;
										return (
											<tr
												key={player.uid}
												className='border-b border-[#AF2D03]/30 hover:bg-[#AF2D03]/10'
											>
												<td className='py-3 pl-6 text-center font-semibold text-[#FF4A00]'>
													{isTop3 ? (
														<Crown
															className={`inline-block h-5 w-5 ${
																index === 0
																	? "text-[#FF3500]"
																	: index === 1
																	? "text-[#FF6A00]"
																	: "text-[#FF8F4A]"
															}`}
															aria-label={`Rank ${index + 1}`}
														/>
													) : (
														<span>{index + 1}</span>
													)}
												</td>
												<td className='py-3 pl-6 font-medium text-white whitespace-nowrap'>
													{player.username}
													{player.isFeatured && (
														<Badge
															variant='outline'
															className='text-[#AF2D03] border-[#AF2D03] ml-2 select-none'
														>
															Streamer
														</Badge>
													)}
												</td>
												<td className='py-3 pr-6 text-right text-[#FF4A00] font-mono font-semibold'>
													${formatCurrency(player.wagered)}
												</td>
												<td
													className={`${getRtpClass(
														player.weightedWagered,
														player.wagered
													)} py-3 pr-6 text-right font-semibold`}
												>
													${formatCurrency(player.weightedWagered)}
												</td>
												<td className='py-3 pl-6 text-white'>
													{player.favoriteGameTitle}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{!isLoading && leaderboard.length === 0 && !error && (
					<div className='py-10 italic text-center text-white/60'>
						No leaderboard data available
					</div>
				)}
			</main>

			{/* Footer */}
			<Footer />
		</div>
	);
});

export default Leaderboard;
