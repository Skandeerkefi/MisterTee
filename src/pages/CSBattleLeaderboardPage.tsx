import { useEffect, useMemo, useState } from "react";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCSBattleAffiliateStore } from "@/store/csBattleAffiliateStore";
import { useLeaderboardDisplayStore } from "@/store/leaderboardDisplayStore";
import dayjs from "dayjs";

const FALLBACK_CSBATTLE_PRIZES: Record<number, number> = {
	1: 500,
	2: 300,
	3: 150,
	4: 100,
	5: 75,
	6: 50,
	7: 25,
};

function parsePeriodEnd(to: string): dayjs.Dayjs | null {
	const trimmed = to.trim();
	const parsed = dayjs(trimmed, "YYYY-MM-DD HH:mm:ss", true);
	if (parsed.isValid()) return parsed;
	const fallback = dayjs(trimmed);
	return fallback.isValid() ? fallback : null;
}

export default function CSBattleLeaderboardPage() {
	const { users, period, loading, error, fetchLeaderboard } =
		useCSBattleAffiliateStore();
	const { config, fetchConfig } = useLeaderboardDisplayStore();
	const [countdown, setCountdown] = useState("");

	const rankPrizes = useMemo(() => {
		const p = config?.csbattle?.prizes;
		const out: Record<number, number> = {};
		const hasSaved = p && Object.keys(p).length > 0;
		for (let r = 1; r <= 7; r++) {
			const v = hasSaved ? p[String(r)] : FALLBACK_CSBATTLE_PRIZES[r];
			if (typeof v === "number") out[r] = v;
		}
		return out;
	}, [config]);

	const totalPoolUsd = useMemo(
		() => Object.values(rankPrizes).reduce((a, b) => a + b, 0),
		[rankPrizes]
	);

	const prizeForRank = (rank: number) => rankPrizes[rank] ?? null;

	useEffect(() => {
		fetchConfig();
	}, [fetchConfig]);

	useEffect(() => {
		fetchLeaderboard();
	}, [fetchLeaderboard]);

	const periodEnd = useMemo(
		() => (period?.to ? parsePeriodEnd(period.to) : null),
		[period?.to]
	);

	useEffect(() => {
		if (!periodEnd) {
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

	return (
		<div className='relative flex flex-col min-h-screen text-white bg-black'>
			<GraphicalBackground />
			<Navbar />

			<main className='container relative z-10 flex-1 max-w-5xl px-4 py-8 mx-auto'>
				<h1 className='mb-2 text-3xl font-extrabold text-center sm:text-5xl text-red-500 drop-shadow-lg'>
					CSBattle Affiliate Leaderboard
				</h1>
				{period && (
					<p className='text-center text-sm text-slate-400'>
						Period:{" "}
						<span className='text-red-300'>
							{period.from} → {period.to}
						</span>
					</p>
				)}
				{countdown && (
					<p className='mt-1 text-center text-sm font-semibold text-amber-300'>
						{countdown}
					</p>
				)}
				<p className='mt-3 text-lg font-semibold text-center text-amber-300'>
					Total prize pool:{" "}
					<span className='text-white'>
						${totalPoolUsd.toLocaleString()} USD
					</span>
				</p>
				<p className='mt-1 text-sm text-center text-slate-400'>
					1st ${rankPrizes[1]?.toLocaleString() ?? "—"} · 2nd $
					{rankPrizes[2]?.toLocaleString() ?? "—"} · 3rd $
					{rankPrizes[3]?.toLocaleString() ?? "—"} · 4th $
					{rankPrizes[4]?.toLocaleString() ?? "—"} · 5th $
					{rankPrizes[5]?.toLocaleString() ?? "—"} · 6th $
					{rankPrizes[6]?.toLocaleString() ?? "—"} · 7th $
					{rankPrizes[7]?.toLocaleString() ?? "—"}
				</p>
				<p className='mt-4 text-center text-slate-300'>
					Ranked by total wager. Use MisterTee&apos;s CSBattle code to climb the
					board.
				</p>

				{loading && (
					<p className='mt-10 text-center text-slate-400'>Loading leaderboard…</p>
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
					<div className='mt-8 overflow-x-auto rounded-2xl border border-red-600/50 shadow-xl bg-gray-950/80'>
						<table className='min-w-full text-sm'>
							<thead>
								<tr className='text-left text-white bg-gradient-to-r from-red-800 to-black'>
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
									const prizeUsd = prizeForRank(u.rank);
									return (
										<tr
											key={u.uuid || `${u.rank}-${idx}`}
											className={
												u.rank <= 3
													? "bg-red-900/35 hover:bg-red-900/50"
													: u.rank <= 7
														? "bg-amber-950/25 hover:bg-amber-950/40"
														: idx % 2 === 0
															? "bg-gray-900/80 hover:bg-gray-800/90"
															: "bg-black/40 hover:bg-gray-900/80"
											}
										>
											<td className='p-3 font-bold text-red-400'>#{u.rank}</td>
											<td className='p-3'>
												<div className='flex items-center gap-3'>
													{u.avatar ? (
														<img
															src={u.avatar}
															alt=''
															className='object-cover w-10 h-10 rounded-full border border-red-500/40'
														/>
													) : (
														<div className='flex items-center justify-center w-10 h-10 text-xs font-bold rounded-full bg-red-900/50 text-red-200'>
															?
														</div>
													)}
													<span className='font-medium text-white'>
														{u.username}
													</span>
												</div>
											</td>
											<td className='p-3 font-semibold text-right text-red-300'>
												{u.wager.toLocaleString(undefined, {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												})}
											</td>
											<td className='p-3 font-semibold text-right text-amber-300'>
												{prizeUsd != null
													? `$${prizeUsd.toLocaleString()}`
													: "—"}
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
