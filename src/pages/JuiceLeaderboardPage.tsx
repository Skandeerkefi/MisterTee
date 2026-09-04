import { useEffect, useMemo, useState } from "react";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import LeaderboardPodium from "@/components/LeaderboardPodium";
import { useLeaderboardDisplayStore } from "@/store/leaderboardDisplayStore";
import { useJuiceLeaderboardStore } from "@/store/useJuiceLeaderboardStore";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";

dayjs.extend(duration);
dayjs.extend(utc);

const FALLBACK_JUICE_PRIZES: Record<number, number> = {
	1: 500,
	2: 300,
	3: 150,
	4: 100,
	5: 75,
	6: 50,
	7: 25,
	8: 0,
	9: 0,
	10: 0,
};

function formatWeightedAmount(amount: number): string {
	return amount.toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

function parsePeriodEnd(endDate: string): Date | null {
	if (!endDate) return null;
	const parsed = new Date(`${endDate}T23:59:59.999Z`);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function JuiceLeaderboardPage() {
	const { users, period, loading, error, fetchLeaderboard } =
		useJuiceLeaderboardStore();
	const { config, fetchConfig } = useLeaderboardDisplayStore();
	const [countdown, setCountdown] = useState("");

	const rankPrizes = useMemo(() => {
		const prizes = config?.juice?.prizes;
		const out: Record<number, number> = {};
		for (let rank = 1; rank <= 10; rank += 1) {
			const value = prizes?.[String(rank)] ?? FALLBACK_JUICE_PRIZES[rank];
			if (typeof value === "number") out[rank] = value;
		}
		return out;
	}, [config]);

	const periodEnd = useMemo(
		() => parsePeriodEnd(period?.endDate || config?.juice?.endDate || ""),
		[config?.juice?.endDate, period?.endDate]
	);

	const totalPrizePool = useMemo(
		() => Object.values(rankPrizes).reduce((sum, prize) => sum + prize, 0),
		[rankPrizes]
	);

	const displayRange = useMemo(() => {
		const s = period?.startDate || config?.juice?.startDate || "";
		const e = period?.endDate || config?.juice?.endDate || "";
		if (s && e) return { start: dayjs.utc(s).format("MMMM D"), end: dayjs.utc(e).format("MMMM D") };
		if (s) return { start: dayjs.utc(s).format("MMMM D"), end: "—" };
		if (e) return { start: "—", end: dayjs.utc(e).format("MMMM D") };
		return { start: dayjs.utc().startOf("month").format("MMMM D"), end: dayjs.utc().endOf("month").format("MMMM D") };
	}, [config?.juice?.endDate, config?.juice?.startDate, period?.endDate, period?.startDate]);

	useEffect(() => {
		fetchConfig();
	}, [fetchConfig]);

	useEffect(() => {
		fetchLeaderboard();
	}, [fetchLeaderboard]);

	useEffect(() => {
		if (!periodEnd) {
			setCountdown("");
			return;
		}

		const tick = () => {
			const diff = periodEnd.getTime() - Date.now();
			if (diff <= 0) {
				setCountdown("Leaderboard period ended");
				return;
			}

			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
			const minutes = Math.floor((diff / (1000 * 60)) % 60);
			const seconds = Math.floor((diff / 1000) % 60);
			setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s remaining`);
		};

		tick();
		const intervalId = window.setInterval(tick, 1000);
		return () => window.clearInterval(intervalId);
	}, [periodEnd]);

	return (
		<div className='relative flex flex-col min-h-screen'>
			<GraphicalBackground />
			<Navbar />

			<main className='relative z-10 flex-grow w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 mx-auto'>
				<h1 className='mb-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-[#F5F7FA] drop-shadow-lg'>
					Juice.gg Leaderboard – ${totalPrizePool.toLocaleString()} Prize Pool
				</h1>

				<p className='mb-2 text-center text-sm font-medium text-[#8B93A3]'>
					Event Duration: <span className='font-bold text-[#A78BFA]'>{displayRange.start} - {displayRange.end} (UTC)</span>
				</p>

				<p className='mb-2 text-center text-md font-semibold text-[#F5F7FA]'>
					⏳ Time Remaining: <span className='text-[#A78BFA] font-bold'>{countdown || "—"}</span>
				</p>
				<p className='mb-8 text-center text-xs text-[#8B93A3]'>Ranked by weighted play amount — only the selected date range is counted. Use code <span className='font-bold text-white'>MisterTee</span> on juice.gg/r/MisterTee</p>

				<LeaderboardPodium players={[0, 1, 2].map((index) => ({ name: users[index]?.username, value: users[index] ? `${formatWeightedAmount(users[index].weighted_play_amount)} weighted` : undefined, prize: rankPrizes[index + 1] ? `$${rankPrizes[index + 1].toLocaleString()}` : undefined }))} valueLabel='Juice.gg weighted play rankings' />

				{loading && (
					<div className='flex items-center justify-center h-56'>
						<Loader2 className='w-10 h-10 text-[#A78BFA] animate-spin' />
					</div>
				)}
				{error && <p className='mt-10 text-center text-[#e10600]'>{error}</p>}
				{!loading && !error && users.length === 0 && (
					<p className='mt-10 text-center text-[#8B93A3]'>No Juice leaderboard data is available for the selected period.</p>
				)}
				{!loading && !error && users.length > 0 && users.length <= 3 && (
					<p className='mt-6 text-center text-xs text-[#5F6878]'>Only top 3 — more players will appear as the period fills.</p>
				)}
				{!loading && !error && users.length > 3 && (
					<div className='overflow-x-auto rounded-xl border border-[#252B38] bg-[#121620]/80 p-4'>
						<table className='w-full min-w-[600px] text-left'>
							<thead className='border-b border-[#252B38] text-xs uppercase tracking-widest text-[#8B93A3]'>
								<tr>
									<th className='p-3'>Rank</th>
									<th className='p-3'>Player</th>
									<th className='p-3 text-right'>Weighted Play</th>
									<th className='p-3 text-right'>Prize</th>
								</tr>
							</thead>
							<tbody>
								{users.slice(3).map((user) => {
									const prize = rankPrizes[user.rank] ?? 0;
									return (
										<tr
											key={String(user.id ?? user.rank)}
											className='border-b border-[#252B38]/70 text-[#F5F7FA] hover:bg-[#8B5CF6]/10'
										>
											<td className='p-3 font-bold text-[#A78BFA]'>#{user.rank}</td>
											<td className='p-3'>
												<div className='flex items-center gap-3'>
													{user.avatar ? (
														<img
															src={user.avatar}
															alt=''
															className='object-cover w-8 h-8 rounded-full border border-[#252B38]'
														/>
													) : (
														<div className='flex items-center justify-center w-8 h-8 text-xs font-bold rounded-full bg-[#252B38] text-[#8B93A3]'>
															?
														</div>
													)}
													<span className='font-semibold'>{user.username}</span>
												</div>
											</td>
											<td className='p-3 text-right font-semibold text-[#F5F7FA]'>
												{formatWeightedAmount(user.weighted_play_amount)}
											</td>
											<td className='p-3 text-right font-bold text-[#A78BFA]'>
												{prize > 0 ? `$${prize.toLocaleString()}` : "—"}
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
}


