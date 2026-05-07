import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import {
	type LeaderboardDisplayConfig,
	useLeaderboardDisplayStore,
} from "@/store/leaderboardDisplayStore";

const ROOBET_RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const CSBATTLE_RANKS = [1, 2, 3, 4, 5, 6, 7] as const;

export default function AdminLeaderboardPage() {
	const user = useAuthStore((s) => s.user);
	const token = useAuthStore((s) => s.token);
	const { config, loading, error, fetchConfig, saveConfig } =
		useLeaderboardDisplayStore();
	const [form, setForm] = useState<LeaderboardDisplayConfig | null>(null);
	const [saving, setSaving] = useState(false);
	const [saveMsg, setSaveMsg] = useState<string | null>(null);
	const [saveErr, setSaveErr] = useState<string | null>(null);

	useEffect(() => {
		fetchConfig();
	}, [fetchConfig]);

	useEffect(() => {
		if (config) setForm(JSON.parse(JSON.stringify(config)) as LeaderboardDisplayConfig);
	}, [config]);

	if (!user || user.role !== "admin") {
		return <Navigate to='/login' replace />;
	}

	const onSave = async () => {
		if (!form || !token) return;
		setSaving(true);
		setSaveMsg(null);
		setSaveErr(null);
		try {
			const payload: LeaderboardDisplayConfig = {
				roobet: {
					startDate: form.roobet.startDate?.trim() || null,
					endDate: form.roobet.endDate?.trim() || null,
					prizes: { ...form.roobet.prizes },
				},
				csbattle: {
					from: form.csbattle.from.trim(),
					to: form.csbattle.to.trim(),
					prizes: { ...form.csbattle.prizes },
				},
			};
			await saveConfig(payload, token);
			setSaveMsg("Saved. CSBattle cache cleared; new dates apply immediately.");
		} catch (e: unknown) {
			setSaveErr(e instanceof Error ? e.message : "Save failed");
		} finally {
			setSaving(false);
		}
	};

	const updateRoobetPrize = (rank: number, value: string) => {
		if (!form) return;
		const n = value === "" ? 0 : Number(value);
		setForm({
			...form,
			roobet: {
				...form.roobet,
				prizes: {
					...form.roobet.prizes,
					[String(rank)]: Number.isFinite(n) ? Math.max(0, n) : 0,
				},
			},
		});
	};

	const updateCsPrize = (rank: number, value: string) => {
		if (!form) return;
		const n = value === "" ? 0 : Number(value);
		setForm({
			...form,
			csbattle: {
				...form.csbattle,
				prizes: {
					...form.csbattle.prizes,
					[String(rank)]: Number.isFinite(n) ? Math.max(0, n) : 0,
				},
			},
		});
	};

	return (
		<div className='relative flex flex-col min-h-screen text-white bg-black'>
			<GraphicalBackground />
			<Navbar />

			<main className='container relative z-10 flex-1 max-w-3xl px-4 py-10 mx-auto'>
				<h1 className='mb-2 text-3xl font-bold text-center text-[#E10600]'>
					Admin — Leaderboard display
				</h1>
				<p className='mb-8 text-sm text-center text-slate-400'>
					Set Roobet and CSBattle prize amounts and date ranges shown on the site.
					Roobet: leave dates empty to use the current UTC calendar month for API
					data.
				</p>

				{loading && !form && (
					<p className='text-center text-slate-400'>Loading settings…</p>
				)}
				{error && (
					<p className='mb-4 text-center text-red-400' role='alert'>
						{error}
					</p>
				)}

				{form && (
					<div className='space-y-10'>
						<section className='p-6 border rounded-2xl border-white/10 bg-black/50'>
							<h2 className='mb-4 text-xl font-semibold text-amber-300'>
								Roobet
							</h2>
							<div className='grid gap-4 sm:grid-cols-2'>
								<div>
									<Label htmlFor='rb-start'>Start date (UTC)</Label>
									<Input
										id='rb-start'
										type='date'
										className='mt-1 text-black bg-white'
										value={form.roobet.startDate ?? ""}
										onChange={(e) =>
											setForm({
												...form,
												roobet: {
													...form.roobet,
													startDate: e.target.value || null,
												},
											})
										}
									/>
								</div>
								<div>
									<Label htmlFor='rb-end'>End date (UTC)</Label>
									<Input
										id='rb-end'
										type='date'
										className='mt-1 text-black bg-white'
										value={form.roobet.endDate ?? ""}
										onChange={(e) =>
											setForm({
												...form,
												roobet: {
													...form.roobet,
													endDate: e.target.value || null,
												},
											})
										}
									/>
								</div>
							</div>
							<div className='grid grid-cols-2 gap-3 mt-4 sm:grid-cols-3'>
								{ROOBET_RANKS.map((r) => (
									<div key={r}>
										<Label htmlFor={`rb-p-${r}`}>Rank {r} ($)</Label>
										<Input
											id={`rb-p-${r}`}
											type='number'
											min={0}
											className='mt-1 text-black bg-white'
											value={form.roobet.prizes[String(r)] ?? 0}
											onChange={(e) => updateRoobetPrize(r, e.target.value)}
										/>
									</div>
								))}
							</div>
						</section>

						<section className='p-6 border rounded-2xl border-white/10 bg-black/50'>
							<h2 className='mb-4 text-xl font-semibold text-amber-300'>
								CSBattle
							</h2>
							<p className='mb-3 text-xs text-slate-500'>
								Use the same format as the CSBattle API, e.g.{" "}
								<code className='text-slate-300'>2025-04-10 00:00:00</code>
							</p>
							<div className='grid gap-4'>
								<div>
									<Label htmlFor='cs-from'>From</Label>
									<Input
										id='cs-from'
										className='mt-1 font-mono text-black bg-white'
										placeholder='2025-04-10 00:00:00'
										value={form.csbattle.from}
										onChange={(e) =>
											setForm({
												...form,
												csbattle: { ...form.csbattle, from: e.target.value },
											})
										}
									/>
								</div>
								<div>
									<Label htmlFor='cs-to'>To</Label>
									<Input
										id='cs-to'
										className='mt-1 font-mono text-black bg-white'
										placeholder='2030-04-19 23:59:59'
										value={form.csbattle.to}
										onChange={(e) =>
											setForm({
												...form,
												csbattle: { ...form.csbattle, to: e.target.value },
											})
										}
									/>
								</div>
							</div>
							<div className='grid grid-cols-2 gap-3 mt-4 sm:grid-cols-3'>
								{CSBATTLE_RANKS.map((r) => (
									<div key={r}>
										<Label htmlFor={`cs-p-${r}`}>Rank {r} ($)</Label>
										<Input
											id={`cs-p-${r}`}
											type='number'
											min={0}
											className='mt-1 text-black bg-white'
											value={form.csbattle.prizes[String(r)] ?? 0}
											onChange={(e) => updateCsPrize(r, e.target.value)}
										/>
									</div>
								))}
							</div>
						</section>

						<div className='flex flex-col items-center gap-3'>
							<Button
								type='button'
								size='lg'
								className='bg-[#E10600] hover:bg-[#b00500] text-white'
								disabled={saving}
								onClick={() => onSave()}
							>
								{saving ? "Saving…" : "Save settings"}
							</Button>
							{saveMsg && (
								<p className='text-sm text-green-400 text-center'>{saveMsg}</p>
							)}
							{saveErr && (
								<p className='text-sm text-red-400 text-center' role='alert'>
									{saveErr}
								</p>
							)}
						</div>
					</div>
				)}

			</main>

			<Footer />
		</div>
	);
}
