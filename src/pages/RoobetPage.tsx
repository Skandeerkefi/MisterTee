import React, { useEffect, useState } from "react";
import { useRoobetStore } from "../store/RoobetStore";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import dayjs from "dayjs"; // npm install dayjs

const COOLDOWN_MS = 5 * 60 * 1000; // 🕒 5 minutes cooldown

const RoobetPage: React.FC = () => {
	const { leaderboard, loading, error, fetchLeaderboard } = useRoobetStore();
	const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

	// 🧠 Helper: start cooldown countdown
	useEffect(() => {
		const interval = setInterval(() => {
			const lastFetch = localStorage.getItem("roobet_leaderboard_last_fetch");
			if (lastFetch) {
				const elapsed = Date.now() - parseInt(lastFetch);
				const remaining = Math.max(0, COOLDOWN_MS - elapsed);
				setCooldownRemaining(remaining);
			} else {
				setCooldownRemaining(0);
			}
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	// 🧊 Fetch leaderboard with cooldown
	useEffect(() => {
		const lastFetched = localStorage.getItem("roobet_leaderboard_last_fetch");
		const now = Date.now();

		if (lastFetched && now - parseInt(lastFetched) < COOLDOWN_MS) {
			console.log("⏳ Cooldown active — skipping fetch...");
			return;
		}

		fetchLeaderboard();
		localStorage.setItem("roobet_leaderboard_last_fetch", now.toString());
	}, [fetchLeaderboard]);

	// 🗓️ Dynamic month range
	const now = dayjs();
	const startOfMonth = now.startOf("month").format("MMMM D");
	const endOfMonth = now.endOf("month").format("MMMM D");

	// 💰 Prize mapping by rank
	const prizeMap: Record<number, string> = {
		1: "$450",
		2: "$250",
		3: "$100",
		4: "$75",
		5: "$50",
		6: "$25",
		7: "$25",
		8: "$25",
	};

	// 🕒 Convert remaining ms → mm:ss
	const formatCooldown = (ms: number) => {
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	return (
		<div className='relative flex flex-col min-h-screen'>
			<GraphicalBackground />
			<Navbar />

			<main className='relative z-10 flex-grow w-full max-w-6xl px-6 py-10 mx-auto'>
				<h1 className='mb-4 text-4xl font-extrabold text-center text-[#fefefe] drop-shadow-lg'>
					🎰 Roobet Leaderboard – $1,000 Prize Pool
				</h1>

				{/* 🗓️ Event Range */}
				<p className='mb-8 text-center text-lg font-medium text-[#ffd01f] drop-shadow-md'>
					Event Duration:{" "}
					<span className='font-bold'>
						{startOfMonth} - {endOfMonth}
					</span>
				</p>

				{/* 🧊 Cooldown Notice */}
				{cooldownRemaining > 0 && (
					<p className='text-center text-sm text-gray-300 mb-4'>
						Next refresh available in{" "}
						<span className='text-[#ffd01f] font-bold'>
							{formatCooldown(cooldownRemaining)}
						</span>
					</p>
				)}

				{loading && (
					<p className='text-center text-[#fefefe]'>Loading leaderboard...</p>
				)}
				{error && <p className='text-center text-[#e10600]'>{error}</p>}

				{leaderboard && (
					<>
						<p className='mb-6 text-sm italic text-[#fefefe] text-center'>
							{leaderboard.disclosure}
						</p>

						{/* 🏆 Top 3 */}
						<div className='grid grid-cols-1 gap-6 mb-10 md:grid-cols-3'>
							{leaderboard.data.slice(0, 3).map((player) => (
								<div
									key={player.uid}
									className='relative p-6 rounded-3xl shadow-2xl border-4 border-[#e10600]
                        flex flex-col items-center justify-center bg-gradient-to-br
                        from-[#e10600] to-[#030303] hover:scale-105 transform transition-all duration-300'
								>
									<div className='absolute -top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full bg-[#fefefe] text-[#e10600] font-bold text-lg shadow-lg'>
										#{player.rankLevel}
									</div>

									<p className='text-2xl md:text-3xl font-extrabold text-[#fefefe] mb-2 drop-shadow-lg'>
										{player.username}
									</p>

									{prizeMap[player.rankLevel] && (
										<p className='text-lg font-bold text-[#ffd01f] drop-shadow-md'>
											🏆 Prize: {prizeMap[player.rankLevel]}
										</p>
									)}

									<div className='flex flex-col items-center gap-1 mt-2'>
										<p className='text-md md:text-lg font-semibold text-[#fefefe]'>
											🎲 Wagered:{" "}
											<span className='text-[#e10600]'>
												{player.wagered.toLocaleString(undefined, {
													maximumFractionDigits: 2,
												})}
											</span>
										</p>
										<p className='text-md md:text-lg font-semibold text-[#fefefe]'>
											⚡ Weighted:{" "}
											<span className='text-[#ffd01f]'>
												{player.weightedWagered.toLocaleString(undefined, {
													maximumFractionDigits: 2,
												})}
											</span>
										</p>
									</div>

									<p className='mt-3 text-sm md:text-base font-medium text-[#fefefe] italic'>
										Favorite: {player.favoriteGameTitle}
									</p>
								</div>
							))}
						</div>

						{/* 📋 Rest of the leaderboard */}
						{leaderboard.data.length > 3 && (
							<div className='overflow-x-auto p-6 shadow-lg bg-[#030303]/80 backdrop-blur-md rounded-2xl'>
								<table className='w-full text-left border-collapse'>
									<thead className='text-sm tracking-wide text-[#fefefe] uppercase bg-[#e10600]'>
										<tr>
											<th className='p-3'>Rank</th>
											<th className='p-3'>Username</th>
											<th className='p-3'>Wagered</th>
											<th className='p-3'>Weighted Wagered</th>
											<th className='p-3'>Favorite Game</th>
											<th className='p-3'>Prize</th>
										</tr>
									</thead>
									<tbody>
										{leaderboard.data.slice(3).map((player) => (
											<tr
												key={player.uid}
												className='transition hover:bg-[#e10600]/80 bg-[#030303]/50 text-[#fefefe]'
											>
												<td className='p-3 font-bold'>{player.rankLevel}</td>
												<td className='p-3 font-semibold'>{player.username}</td>
												<td className='p-3'>{player.wagered.toLocaleString()}</td>
												<td className='p-3'>
													{player.weightedWagered.toLocaleString()}
												</td>
												<td className='p-3'>{player.favoriteGameTitle}</td>
												<td className='p-3 font-bold text-[#ffd01f]'>
													{prizeMap[player.rankLevel] ?? "-"}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</>
				)}
			</main>

			<Footer />
		</div>
	);
};

export default RoobetPage;
