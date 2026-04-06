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

			<main className='container relative z-10 flex-1 max-w-6xl px-6 py-12 mx-auto'>
				<div className='mb-8 text-center'>
					<div className='inline-flex items-center gap-3 px-4 py-2 text-red-200 border rounded-full shadow-lg border-red-500/40 bg-red-500/10 shadow-red-950/20'>
						<Diamond className='w-5 h-5' />
						<span className='text-sm font-semibold uppercase tracking-[0.3em]'>500 Coins</span>
					</div>
					<h1 className='mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl'>
						Diamonds Bi-Weekly Leaderboard
					</h1>
					<p className='mt-3 text-sm text-slate-300'>
						Period: {periodLabel}
					</p>
					<p className='mt-1 text-sm text-red-200'>{countdown}</p>
				</div>

				<div className='grid gap-4 mb-10 md:grid-cols-3'>
					{[
						{ label: "Top 2", place: 2, reward: 120, player: podiumPlayers[1] },
						{ label: "Top 1", place: 1, reward: 250, player: podiumPlayers[0] },
						{ label: "Top 3", place: 3, reward: 70, player: podiumPlayers[2] },
					].map((item) => (
						<div
							key={item.label}
							className='p-6 text-center border shadow-xl rounded-2xl border-red-500/20 bg-white/5 shadow-black/20 backdrop-blur'
						>
							<p className='text-sm uppercase tracking-[0.2em] text-red-200'>{item.label}</p>
							<p className='mt-2 text-3xl font-bold text-white'>
								{item.reward}
							</p>
							<p className='mt-1 text-sm text-slate-300'>coins</p>
							<div className='px-4 py-3 mt-4 border rounded-xl border-white/10 bg-black/20'>
								{item.player ? (
									<>
										<p className='text-sm uppercase tracking-[0.2em] text-slate-400'>Rank #{item.place}</p>
										<p className='mt-2 text-lg font-semibold text-white'>
											{getDiamondDisplayName(item.player)}
										</p>
										<p className='mt-1 text-sm text-red-200'>
											{getDiamondDisplayValue(item.player).toLocaleString()}
										</p>
									</>
								) : (
									<p className='text-sm text-slate-400'>Waiting for leaderboard data</p>
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
					<div className='px-6 py-4 border-b border-white/10'>
						<h2 className='text-xl font-semibold text-white'>Top 10</h2>
					</div>

					{loading ? (
						<div className='flex items-center justify-center h-64'>
							<Loader2 className='w-10 h-10 text-red-300 animate-spin' />
						</div>
					) : topTen.length > 0 ? (
						<div className='overflow-x-auto'>
							<table className='w-full text-left'>
								<thead className='bg-white/5 text-sm uppercase tracking-[0.2em] text-slate-300'>
									<tr>
										<th className='px-6 py-4'>Place</th>
										<th className='px-6 py-4'>User</th>
										<th className='px-6 py-4'>Value</th>
										<th className='px-6 py-4'>Prize</th>
									</tr>
								</thead>
								<tbody>
									{tablePlayers.map((entry, index) => (
										<tr key={`${getDiamondDisplayName(entry)}-${index}`} className='border-t border-white/10'>
											<td className='px-6 py-4 font-semibold text-red-200'>#{index + 4}</td>
											<td className='px-6 py-4 text-white'>{getDiamondDisplayName(entry)}</td>
											<td className='px-6 py-4 text-slate-200'>
												{getDiamondDisplayValue(entry).toLocaleString()}
											</td>
											<td className='px-6 py-4 text-slate-200'>
												{prizeMap[index + 4] ? `$${prizeMap[index + 4]}` : "-"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className='px-6 py-16 text-center text-slate-300'>
							No leaderboard data available for this period.
						</div>
					)}
				</section>
			</main>

			<Footer />
		</div>
	);
}