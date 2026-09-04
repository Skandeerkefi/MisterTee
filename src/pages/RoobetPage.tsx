import React, { useEffect, useMemo, useState } from "react";
import { useRoobetStore } from "../store/RoobetStore";
import { useLeaderboardDisplayStore } from "@/store/leaderboardDisplayStore";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import LeaderboardPodium from "@/components/LeaderboardPodium";
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

			<main className='relative z-10 flex-grow w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 mx-auto'>
				<h1 className='mb-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-[#F5F7FA] drop-shadow-lg'>
					Roobet Leaderboard – ${totalPool.toLocaleString()} Prize Pool
				</h1>

				<p className='mb-2 text-center text-sm font-medium text-[#8B93A3]'>
					Event Duration: <span className='font-bold text-[#A78BFA]'>{displayRange.start} - {displayRange.end} (UTC)</span>
				</p>

				<p className='mb-2 text-center text-md font-semibold text-[#F5F7FA]'>
					⏳ Time Remaining Until Next Reset: <span className='text-[#A78BFA] font-bold'>{timeLeft || "—"}</span>
				</p>
				<p className='mb-8 text-center text-xs text-[#8B93A3]'>Use code <span className='font-bold text-white'>"MisterTee"</span> on roobet.com — wager abuse is prohibited and may void your prize</p>

				{loading && (
					<p className='text-center text-[#8B93A3]'>Loading leaderboard...</p>
				)}
				{error && <p className='text-center text-[#e10600]'>{error}</p>}







				{leaderboard && (
					<>
						<p className='mb-6 text-center text-sm italic text-[#8B93A3]'>{leaderboard.disclosure}</p>
						<LeaderboardPodium players={leaderboard.data.slice(0, 3).map((player) => ({ name: player.username, value: `${player.wagered.toLocaleString()} wagered`, prize: prizeMap[player.rankLevel] ? `${prizeMap[player.rankLevel]}` : undefined }))} valueLabel='Roobet affiliate rankings' />
						{leaderboard.data.length > 3 && <div className='overflow-x-auto rounded-xl border border-[#252B38] bg-[#121620]/80 p-4'><table className='w-full min-w-[700px] text-left'><thead className='border-b border-[#252B38] text-xs uppercase tracking-widest text-[#8B93A3]'><tr><th className='p-3'>Rank</th><th className='p-3'>Username</th><th className='p-3'>Wagered</th><th className='p-3'>Weighted Wagered</th><th className='p-3'>Favorite Game</th><th className='p-3'>Prize</th></tr></thead><tbody>{leaderboard.data.slice(3).map((player) => <tr key={player.uid} className='border-b border-[#252B38]/70 text-[#F5F7FA] hover:bg-[#8B5CF6]/10'><td className='p-3 font-bold text-[#A78BFA]'>{player.rankLevel}</td><td className='p-3 font-semibold'>{player.username}</td><td className='p-3'>{player.wagered.toLocaleString()}</td><td className='p-3'>{player.weightedWagered.toLocaleString()}</td><td className='p-3'>{player.favoriteGameTitle}</td><td className='p-3 font-bold text-[#A78BFA]'>{prizeMap[player.rankLevel] ?? "-"}</td></tr>)}</tbody></table></div>}
					</>
				)}
			</main>

			<Footer />
		</div>
	);
};

export default RoobetPage;


