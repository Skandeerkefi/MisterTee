import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLeaderboardDisplayStore } from "@/store/leaderboardDisplayStore";
import { useJuiceLeaderboardStore } from "@/store/useJuiceLeaderboardStore";
import { Crown, Loader2, Trophy, Award, Medal } from "lucide-react";

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
		<div className='relative flex flex-col min-h-screen text-white bg-black'>
			<GraphicalBackground />
			<Navbar />

			<main className='container relative z-10 flex-1 max-w-6xl px-4 py-8 mx-auto'>
				<div className='flex flex-col items-center gap-3 mb-8 text-center'>
					<div className='flex items-center gap-3 text-amber-300'>
						<Crown className='w-7 h-7' />
						<h1 className='text-3xl font-extrabold tracking-tight sm:text-5xl'>
							Juice.gg Affiliate Leaderboard
						</h1>
					</div>
					<p className='max-w-2xl text-sm text-slate-300 sm:text-base'>
						Ranked by weighted play amount from Juice.gg&apos;s PLAY_AMOUNT board.
						Only the selected date range is counted.
					</p>
					{period && (
						<p className='text-sm text-slate-400'>
							Period: <span className='text-amber-300'>{period.startDate} → {period.endDate}</span>
						</p>
					)}
					{countdown && <p className='text-sm font-semibold text-amber-300'>{countdown}</p>}
					<p className='text-lg font-semibold text-amber-300'>
						Total prize pool: <span className='text-white'>${totalPrizePool.toLocaleString()}</span>
					</p>
				</div>

				<div className='grid grid-cols-1 gap-4 mb-8 md:grid-cols-3'>
					<PrizeCard
						title='1st Place'
						amount={rankPrizes[1] ?? 0}
						player={users[0]}
						accent='from-amber-500 to-orange-600'
						icon={<Trophy className='w-10 h-10 text-yellow-300' />}
					/>
					<PrizeCard
						title='2nd Place'
						amount={rankPrizes[2] ?? 0}
						player={users[1]}
						accent='from-slate-500 to-slate-700'
						icon={<Award className='w-9 h-9 text-slate-200' />}
					/>
					<PrizeCard
						title='3rd Place'
						amount={rankPrizes[3] ?? 0}
						player={users[2]}
						accent='from-orange-700 to-amber-900'
						icon={<Medal className='w-9 h-9 text-orange-200' />}
					/>
				</div>

				{loading ? (
					<div className='flex items-center justify-center h-56'>
						<Loader2 className='w-10 h-10 text-amber-300 animate-spin' />
					</div>
				) : error ? (
					<p className='mt-10 text-center text-red-400' role='alert'>
						{error}
					</p>
				) : users.length === 0 ? (
					<p className='mt-10 text-center text-slate-400'>
						No Juice leaderboard data is available for the selected period.
					</p>
				) : (
					<div className='overflow-x-auto rounded-2xl border border-amber-500/40 shadow-xl bg-gray-950/80'>
						<table className='min-w-full text-sm'>
							<thead>
								<tr className='text-left text-white bg-gradient-to-r from-amber-700 to-black'>
									<th className='p-3 font-semibold uppercase'>#</th>
									<th className='p-3 font-semibold uppercase'>Player</th>
									<th className='p-3 font-semibold uppercase text-right'>Weighted Play</th>
									<th className='p-3 font-semibold uppercase text-right'>Prize</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user, index) => {
									const prize = rankPrizes[user.rank] ?? 0;
									return (
										<tr
											key={user.id ?? `${user.rank}-${index}`}
											className={`border-t border-amber-900/40 ${
												user.rank <= 3
													? "bg-amber-950/35 hover:bg-amber-950/50"
													: index % 2 === 0
														? "bg-gray-900/80 hover:bg-gray-800/90"
														: "bg-black/40 hover:bg-gray-900/80"
											}`}
										>
											<td className='p-3 font-bold text-amber-300'>#{user.rank}</td>
											<td className='p-3'>
												<div className='flex items-center gap-3'>
													{user.avatar ? (
														<img
															src={user.avatar}
															alt=''
															className='object-cover w-10 h-10 rounded-full border border-amber-500/40'
														/>
													) : (
														<div className='flex items-center justify-center w-10 h-10 text-xs font-bold rounded-full bg-amber-900/50 text-amber-100'>
															?
														</div>
													)}
													<span className='font-medium text-white'>{user.username}</span>
												</div>
											</td>
											<td className='p-3 font-semibold text-right text-amber-300'>
												{formatWeightedAmount(user.weighted_play_amount)}
											</td>
											<td className='p-3 font-semibold text-right text-yellow-300'>
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

interface PrizeCardProps {
	title: string;
	amount: number;
	player?: { username: string; weighted_play_amount: number };
	accent: string;
	icon: ReactNode;
}

function PrizeCard({ title, amount, player, accent, icon }: PrizeCardProps) {
	return (
		<div className='overflow-hidden rounded-xl border border-amber-500/30 bg-black/60 shadow-lg'>
			<div className={`h-2 bg-gradient-to-r ${accent}`} />
			<div className='flex flex-col items-center gap-4 p-6 text-center'>
				{icon}
				<h2 className='text-xl font-bold text-white'>{title}</h2>
				<p className='text-lg font-semibold text-amber-300'>${amount.toLocaleString()}</p>
				{player ? (
					<div>
						<p className='font-medium text-white'>{player.username}</p>
						<p className='text-sm text-slate-300'>
							{formatWeightedAmount(player.weighted_play_amount)} weighted
						</p>
					</div>
				) : (
					<p className='text-sm text-slate-400'>Waiting for leaderboard data</p>
				)}
			</div>
		</div>
	);
}