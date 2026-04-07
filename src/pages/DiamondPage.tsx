import { useEffect, useMemo, useState } from "react";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Diamond } from "lucide-react";

import {
	getDiamondDisplayName,
	getDiamondDisplayValue,
	useDiamondStore,
} from "../store/diamondStore";

function formatDate(date: Date) {
	return date.toISOString().split("T")[0];
}

export default function DiamondPage() {
	const [countdown, setCountdown] = useState("");

	const { leaderboard, loading, error, period, fetchLeaderboard } =
		useDiamondStore();

	const periodLabel = useMemo(
		() => `${formatDate(period.start)} to ${formatDate(period.end)}`,
		[period.end, period.start]
	);

	useEffect(() => {
		fetchLeaderboard(period);
	}, [fetchLeaderboard, period]);

	useEffect(() => {
		const timer = window.setInterval(() => {
			const now = Date.now();
			const diff = period.end.getTime() - now;

			if (diff <= 0) {
				setCountdown("Leaderboard period ended");
				window.clearInterval(timer);
				return;
			}

			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
			const minutes = Math.floor((diff / (1000 * 60)) % 60);
			const seconds = Math.floor((diff / 1000) % 60);

			setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s remaining`);
		}, 1000);

		return () => window.clearInterval(timer);
	}, [period.end]);

	const topTen = leaderboard
		.slice()
		.sort((a, b) => getDiamondDisplayValue(b) - getDiamondDisplayValue(a))
		.slice(0, 10);

	const podiumPlayers = topTen.slice(0, 3);
	const tablePlayers = topTen.slice(3);

	const prizeMap: Record<number, number> = {
		1: 250,
		2: 120,
		3: 70,
		4: 30,
		5: 30,
	};

	return (
		<div className='relative flex flex-col min-h-screen text-white'>
			<GraphicalBackground />
			<Navbar />

			<main className='container relative z-10 flex-1 max-w-6xl px-4 py-6 sm:px-6 sm:py-12 mx-auto'>
				<div className='mb-6 sm:mb-8 text-center'>
					<div className='inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-red-200 border rounded-full shadow-lg border-red-500/40 bg-red-500/10 shadow-red-950/20'>
						<Diamond className='w-4 h-4 sm:w-5 sm:h-5' />
						<span className='font-semibold uppercase tracking-[0.3em]'>500 Coins</span>
					</div>
					<h1 className='mt-3 sm:mt-4 text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight'>
						CsgoDiamonds Bi-Weekly Leaderboard
					</h1>
					<p className='mt-2 sm:mt-3 text-xs sm:text-sm text-slate-300'>
						Period: {periodLabel}
					</p>
					<p className='mt-1 text-xs sm:text-sm text-red-200'>{countdown}</p>
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10'>
					{[
						{ label: "Top 2", place: 2, reward: 120, player: podiumPlayers[1] },
						{ label: "Top 1", place: 1, reward: 250, player: podiumPlayers[0] },
						{ label: "Top 3", place: 3, reward: 70, player: podiumPlayers[2] },
					].map((item) => (
						<div
							key={item.label}
							className='p-4 sm:p-6 text-center border shadow-xl rounded-2xl border-red-500/20 bg-white/5 shadow-black/20 backdrop-blur'
						>
							<p className='text-xs sm:text-sm uppercase tracking-[0.2em] text-red-200'>{item.label}</p>
							<p className='mt-2 text-2xl sm:text-3xl font-bold text-white'>
								{item.reward}
							</p>
							<p className='mt-1 text-xs sm:text-sm text-slate-300'>coins</p>
							<div className='px-3 sm:px-4 py-2 sm:py-3 mt-3 sm:mt-4 border rounded-xl border-white/10 bg-black/20'>
								{item.player ? (
									<>
										<p className='text-xs sm:text-sm uppercase tracking-[0.2em] text-slate-400'>Rank #{item.place}</p>
										<p className='mt-2 text-base sm:text-lg font-semibold text-white'>
											{getDiamondDisplayName(item.player)}
										</p>
										<p className='mt-1 text-xs sm:text-sm text-red-200'>
											{getDiamondDisplayValue(item.player).toLocaleString()}
										</p>
									</>
								) : (
									<p className='text-xs sm:text-sm text-slate-400'>Waiting for leaderboard data</p>
								)}
							</div>
						</div>
					))}
				</div>

				

				{error && (
					<Alert variant='destructive' className='mb-6 text-white border-red-500/40 bg-red-500/15'>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<section className='border shadow-2xl rounded-2xl border-red-500/20 bg-white/5 shadow-black/30 backdrop-blur'>
					<div className='px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10'>
						<h2 className='text-lg sm:text-xl font-semibold text-white'>Top 10</h2>
					</div>

					{loading ? (
						<div className='flex items-center justify-center h-48 sm:h-64'>
							<Loader2 className='w-8 h-8 sm:w-10 sm:h-10 text-red-300 animate-spin' />
						</div>
					) : topTen.length > 0 ? (
						<div className='overflow-x-auto'>
							<table className='w-full text-left text-xs sm:text-sm'>
								<thead className='bg-white/5 uppercase tracking-[0.2em] text-slate-300 text-xs sm:text-sm'>
									<tr>
										<th className='px-2 sm:px-6 py-2 sm:py-4'>Place</th>
										<th className='px-2 sm:px-6 py-2 sm:py-4'>User</th>
										<th className='px-2 sm:px-6 py-2 sm:py-4 text-right'>Value</th>
										<th className='px-2 sm:px-6 py-2 sm:py-4 text-right'>Prize</th>
									</tr>
								</thead>
								<tbody>
									{tablePlayers.map((entry, index) => (
										<tr key={`${getDiamondDisplayName(entry)}-${index}`} className='border-t border-white/10 hover:bg-white/5 transition-colors'>
											<td className='px-2 sm:px-6 py-2 sm:py-4 font-semibold text-red-200'>#{index + 4}</td>
											<td className='px-2 sm:px-6 py-2 sm:py-4 text-white truncate'>{getDiamondDisplayName(entry)}</td>
											<td className='px-2 sm:px-6 py-2 sm:py-4 text-slate-200 text-right'>
												{getDiamondDisplayValue(entry).toLocaleString()}
											</td>
											<td className='px-2 sm:px-6 py-2 sm:py-4 text-slate-200 text-right'>
												{prizeMap[index + 4] ? `$${prizeMap[index + 4]}` : "-"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className='px-4 sm:px-6 py-8 sm:py-16 text-center text-slate-300 text-sm sm:text-base'>
							No leaderboard data available for this period.
						</div>
					)}
				</section>
			</main>

			<Footer />
		</div>
	);
}