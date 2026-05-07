import React, { useEffect, useMemo, useState } from "react";
import { useRoobetStore } from "../store/RoobetStore";
import { useLeaderboardDisplayStore } from "@/store/leaderboardDisplayStore";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";

dayjs.extend(duration);
dayjs.extend(utc);

const FALLBACK_ROOBET_PRIZES: Record<number, number> = {
	1: 675,
	2: 300,
	3: 175,
	4: 100,
	5: 80,
	6: 70,
	7: 50,
	8: 25,
	9: 25,
};

const RoobetPage: React.FC = () => {
	const { leaderboard, loading, error, fetchLeaderboard } = useRoobetStore();
	const { config, fetchConfig } = useLeaderboardDisplayStore();
	const [timeLeft, setTimeLeft] = useState("");

	useEffect(() => {
		fetchConfig();
	}, [fetchConfig]);

	useEffect(() => {
		if (!config) return;
		const s = config.roobet.startDate;
		const e = config.roobet.endDate;
		if (s && e) {
			fetchLeaderboard(s, e);
		} else {
			fetchLeaderboard();
		}
	}, [config, fetchLeaderboard]);

	const nowUTC = dayjs().utc();
	const startOfMonth = nowUTC.startOf("month").format("MMMM D");
	const endOfMonth = nowUTC.endOf("month").format("MMMM D");

	const useCustomPeriod = Boolean(
		config?.roobet?.startDate && config?.roobet?.endDate
	);

	const displayRange = useMemo(() => {
		if (useCustomPeriod && config?.roobet?.startDate && config?.roobet?.endDate) {
			return {
				start: dayjs.utc(config.roobet.startDate).format("MMMM D"),
				end: dayjs.utc(config.roobet.endDate).format("MMMM D"),
			};
		}
		return { start: startOfMonth, end: endOfMonth };
	}, [config, useCustomPeriod, startOfMonth, endOfMonth]);

	const prizeMap = useMemo(() => {
		const p = config?.roobet?.prizes;
		const out: Record<number, string> = {};
		const source = p && Object.keys(p).length > 0 ? p : null;
		for (let r = 1; r <= 9; r++) {
			const amt = source
				? source[String(r)]
				: FALLBACK_ROOBET_PRIZES[r];
			if (typeof amt === "number") {
				out[r] = `$${amt.toLocaleString()}`;
			}
		}
		return out;
	}, [config]);

	const totalPool = useMemo(() => {
		const p = config?.roobet?.prizes;
		if (!p || Object.keys(p).length === 0) {
			return Object.values(FALLBACK_ROOBET_PRIZES).reduce((a, b) => a + b, 0);
		}
		return Object.values(p).reduce(
			(a, b) => a + (typeof b === "number" ? b : 0),
			0
		);
	}, [config]);

	useEffect(() => {
		const updateCountdown = () => {
			const now = dayjs().utc();
			let end: dayjs.Dayjs;
			if (config?.roobet?.startDate && config?.roobet?.endDate) {
				end = dayjs.utc(config.roobet.endDate).endOf("day");
			} else {
				end = now.add(1, "month").startOf("month");
			}
			const diff = end.diff(now);

			if (diff <= 0) {
				setTimeLeft("Leaderboard Resetting...");
				return;
			}

			const d = dayjs.duration(diff);

			const days = Math.floor(d.asDays());
			const hours = d.hours();
			const minutes = d.minutes();
			const seconds = d.seconds();

			setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
		};

		updateCountdown();
		const interval = setInterval(updateCountdown, 1000);
		return () => clearInterval(interval);
	}, [config]);

	return (
		<div className='relative flex flex-col min-h-screen'>
			<GraphicalBackground />
			<Navbar />

			<main className='relative z-10 flex-grow w-full max-w-6xl px-6 py-10 mx-auto'>
				<h1 className='mb-4 text-4xl font-extrabold text-center text-[#fefefe] drop-shadow-lg'>
					🎰 Roobet Leaderboard – ${totalPool.toLocaleString()} Prize Pool
				</h1>

				<p className='mb-2 text-center text-lg font-medium text-[#ffd01f] drop-shadow-md'>
					Event Duration:{" "}
					<span className='font-bold'>
						{displayRange.start} - {displayRange.end} (UTC)
					</span>
				</p>

				<p className='mb-8 text-center text-md font-semibold text-[#fefefe]'>
					⏳ Time Remaining Until Next Reset:{" "}
					<span className='text-[#ffd01f] font-bold'>{timeLeft}</span>
				</p>

				{loading && (
					<p className='text-center text-[#fefefe]'>Loading leaderboard...</p>
				)}
				{error && <p className='text-center text-[#e10600]'>{error}</p>}

				{leaderboard && (
					<>
						<p className='mb-6 text-sm italic text-[#fefefe] text-center'>
							{leaderboard.disclosure}
						</p>

						<div className='grid grid-cols-1 gap-6 mb-10 md:grid-cols-3'>
							{leaderboard.data.slice(0, 3).map((player) => (
								<div
									key={player.uid}
									className='relative p-6 rounded-3xl shadow-2xl border-4 border-[#e10600] flex flex-col items-center justify-center bg-gradient-to-br from-[#e10600] to-[#030303] hover:scale-105 transform transition-all duration-300'
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
