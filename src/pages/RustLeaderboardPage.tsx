import { useEffect, useMemo, useState } from "react";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useRustLeaderboardStore } from "@/store/rustLeaderboardStore";
import dayjs from "dayjs";

/** Display prize amounts as plain numbers without a currency symbol. */
function formatPrize(amount: number): string {
	return amount.toLocaleString();
}

function ordinal(n: number): string {
	if (n === 1) return "1st";
	if (n === 2) return "2nd";
	if (n === 3) return "3rd";
	return `${n}th`;
}

export default function RustLeaderboardPage() {
	const { users, prizes, meta, period, loading, error, fetchLeaderboard } =
		useRustLeaderboardStore();
	const [countdown, setCountdown] = useState("");

	const prizeForRank = (rank: number) =>
		prizes.find((p) => p.place === rank)?.amount ?? null;

	useEffect(() => {
		fetchLeaderboard();
	}, [fetchLeaderboard]);

	const periodEnd = useMemo(
		() => (period?.to ? dayjs(period.to) : null),
		[period?.to]
	);

	useEffect(() => {
		if (!periodEnd || !periodEnd.isValid()) {
			setCountdown("");
			return;
		}

		const tick = () => {
			const diff = periodEnd.diff(dayjs());
			if (diff <= 0) {
				setCountdown("Leaderboard period ended");
				return;
			}
			const d = Math.floor(diff / (1000 * 60 * 60 * 24));
			const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
			const m = Math.floor((diff / (1000 * 60)) % 60);
			const s = Math.floor((diff / 1000) % 60);
			setCountdown(`${d}d ${h}h ${m}m ${s}s remaining`);
		};

		tick();
		const id = window.setInterval(tick, 1000);
		return () => window.clearInterval(id);
	}, [periodEnd]);

	const prizeSummary = useMemo(() => {
		const top = prizes.filter((p) => p.amount > 0).sort((a, b) => a.place - b.place);
		if (top.length === 0) return "";
		return top.map((p) => `${ordinal(p.place)} ${formatPrize(p.amount)}`).join(" · ");
	}, [prizes]);

	return (
		<div className='relative flex flex-col min-h-screen text-white bg-black'>
			<GraphicalBackground />
			<Navbar />

			<main className='container relative z-10 flex-1 max-w-5xl px-4 py-8 mx-auto'>
				<h1 className='mb-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-orange-500 drop-shadow-lg'>
					Rust Leaderboard
				</h1>
				{meta.title && <p className='text-center text-sm text-slate-400'>{meta.title}</p>}
				{period?.from && period?.to && (
					<p className='mt-1 text-center text-sm text-slate-400'>
						Period:{" "}
						<span className='text-orange-300'>
							{dayjs(period.from).format("MMM D, YYYY")} →{" "}
							{dayjs(period.to).format("MMM D, YYYY")}
						</span>
						{meta.frequency && <span className='ml-2 text-slate-500 capitalize'>({meta.frequency})</span>}
					</p>
				)}
				{countdown && (
					<p className='mt-1 text-center text-sm font-semibold text-amber-300'>
						{countdown}
					</p>
				)}
				<p className='mt-3 text-lg font-semibold text-center text-orange-200'>
					Total Prize Pool:{" "}
					{meta.totalPrizePool > 0 ? formatPrize(meta.totalPrizePool) : "—"}
					{prizeSummary && <> · {prizeSummary}</>}
				</p>
				<p className='mt-4 text-center text-slate-300'>
					Ranked by total wager on RustWild with MisterTee&apos;s code to climb the
					board.
				</p>

				{loading && (
					<p className='mt-10 text-center text-slate-400'>Loading leaderboard...</p>
				)}
				{error && (
					<p className='mt-10 text-center text-red-400' role='alert'>
						{error}
					</p>
				)}

				{!loading && !error && users.length === 0 && (
					<p className='mt-10 text-center text-slate-500'>
						No players on the leaderboard yet.
					</p>
				)}

				{!loading && !error && users.length > 0 && (
					<div className='mt-8 overflow-x-auto rounded-2xl border border-orange-600/50 shadow-xl bg-gray-950/80'>
						<table className='min-w-full text-sm'>
							<thead>
								<tr className='text-left text-white bg-gradient-to-r from-orange-900 to-black'>
									<th className='p-3 font-semibold uppercase'>#</th>
									<th className='p-3 font-semibold uppercase'>Player</th>
									<th className='p-3 font-semibold uppercase text-right'>
										Wager
									</th>
									<th className='p-3 font-semibold uppercase text-right'>
										Prize
									</th>
								</tr>
							</thead>
							<tbody>
								{users.map((u, idx) => {
									const prize = prizeForRank(u.rank);
									return (
										<tr
											key={u.id ?? `${u.rank}-${idx}`}
											className={
												u.rank <= 3
													? "bg-orange-900/35 hover:bg-orange-900/50"
													: u.rank <= 7
													? "bg-amber-950/25 hover:bg-amber-950/40"
													: idx % 2 === 0
													? "bg-gray-900/80 hover:bg-gray-800/90"
													: "bg-black/40 hover:bg-gray-900/80"
											}
										>
											<td className='p-3 font-bold text-orange-400'>#{u.rank}</td>
											<td className='p-3'>
												<div className='flex items-center gap-3'>
													{u.avatar ? (
														<img
															src={u.avatar}
															alt=''
															className='object-cover w-10 h-10 rounded-full border border-orange-500/40'
															loading='lazy'
														/>
													) : (
														<div className='flex items-center justify-center w-10 h-10 text-xs font-bold rounded-full bg-orange-900/50 text-orange-200'>
															?
														</div>
													)}
													<span className='font-medium text-white'>
														{u.username}
														{u.level > 0 && (
															<span className='ml-2 text-xs font-semibold text-orange-400/80'>
																Lvl {u.level}
															</span>
														)}
													</span>
												</div>
											</td>
											<td className='p-3 font-semibold text-right text-orange-300'>
												{u.wager.toLocaleString(undefined, {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												})}
											</td>
											<td className='p-3 font-semibold text-right text-amber-300'>
												{prize != null && prize > 0 ? formatPrize(prize) : "—"}
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