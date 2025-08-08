import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import {
	useLeaderboardStore,
	LeaderboardPlayer,
} from "@/store/useLeaderboardStore";
import { Crown, Info, Loader2, Trophy, Award, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

function LeaderboardPage() {
	const { monthlyLeaderboard, fetchLeaderboard, isLoading, error } =
		useLeaderboardStore();

	useEffect(() => {
		fetchLeaderboard();
	}, [fetchLeaderboard]);

	// Current month range
	const now = new Date();
	const start_at = new Date(now.getFullYear(), now.getMonth(), 1)
		.toISOString()
		.split("T")[0];
	const end_at = new Date(now.getFullYear(), now.getMonth() + 1, 0)
		.toISOString()
		.split("T")[0];

	const [timeLeft, setTimeLeft] = useState<string>("");

	useEffect(() => {
		const interval = setInterval(() => {
			const endDate = new Date(end_at + "T23:59:59");
			const now = new Date();
			const diff = endDate.getTime() - now.getTime();

			if (diff <= 0) {
				setTimeLeft("Leaderboard period has ended.");
				clearInterval(interval);
				return;
			}

			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
			const minutes = Math.floor((diff / (1000 * 60)) % 60);
			const seconds = Math.floor((diff / 1000) % 60);

			setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s remaining`);
		}, 1000);

		return () => clearInterval(interval);
	}, [end_at]);

	return (
		<div className='flex flex-col min-h-screen bg-[#FFFFFF] text-[#000000]'>
			<Navbar />

			<main className='container flex-grow py-8'>
				{/* Header */}
				<div className='flex items-center justify-between mb-8'>
					<div className='flex items-center gap-2'>
						<Crown className='w-6 h-6 text-[#000000]' />
						<h1 className='text-3xl font-bold'>Rainbet Monthly Leaderboard</h1>
					</div>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className='flex items-center gap-1 text-sm text-[#000000] hover:text-gray-700 cursor-help'>
									<Info className='w-4 h-4' />
									<span>How It Works</span>
								</div>
							</TooltipTrigger>
							<TooltipContent className='max-w-xs bg-[#FFFFFF] text-[#000000] border border-[#E0E0E0] shadow-lg'>
								<p>
									The leaderboard ranks players based on their total wager
									amount using the MisterTee affiliate code on Rainbet. Higher
									wagers result in a better ranking.
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>

				{/* Affiliate Info */}
				<div className='p-6 mb-8 rounded-lg bg-[#F5F5F5] border border-[#E0E0E0]'>
					<p className='mb-4 text-[#000000]'>
						Use affiliate code{" "}
						<span className='font-semibold text-[#000000]'>MisterTee</span> on{" "}
						<a
							href='https://rainbet.com'
							target='_blank'
							rel='noreferrer'
							className='mx-1 text-[#000000] hover:underline'
						>
							Rainbet
						</a>{" "}
						to appear on this leaderboard and compete for rewards!
					</p>

					<div className='flex items-center gap-4'>
						<div className='px-3 py-1.5 rounded-md bg-[#E0E0E0] flex items-center'>
							<span className='text-[#000000]'>Affiliate Code:</span>
							<span className='ml-2 font-bold text-[#000000]'>MisterTee</span>
						</div>
					</div>
				</div>

				{/* Error Alert */}
				{error && (
					<Alert
						variant='destructive'
						className='mb-6 bg-[#E0E0E0]/50 border-[#E0E0E0] text-[#000000]'
					>
						<AlertDescription>
							Failed to load leaderboard: {error}
						</AlertDescription>
					</Alert>
				)}

				{/* Reward Cards */}
				<div className='mb-8'>
					<h2 className='mb-6 text-2xl font-bold text-center text-[#000000]'>
						Top Players
					</h2>
					<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
						{monthlyLeaderboard.length > 0 ? (
							<>
								<RewardCard
									position='2nd Place'
									reward='$250 Cash + Special Role'
									backgroundColor='from-gray-300 to-gray-400'
									player={monthlyLeaderboard[1]}
									icon={<Award className='w-8 h-8 text-gray-600' />}
								/>
								<RewardCard
									position='1st Place'
									reward='$500 Cash + Special Role'
									backgroundColor='from-black to-gray-800'
									player={monthlyLeaderboard[0]}
									icon={<Trophy className='w-8 h-8 text-black' />}
								/>
								<RewardCard
									position='3rd Place'
									reward='$100 Cash + Special Role'
									backgroundColor='from-gray-800 to-gray-900'
									player={monthlyLeaderboard[2]}
									icon={<Medal className='w-8 h-8 text-gray-700' />}
								/>
							</>
						) : (
							<>
								<RewardCard
									position='1st Place'
									reward='$500 Cash + Special Role'
									backgroundColor='from-black to-gray-800'
									icon={<Trophy className='w-8 h-8 text-black' />}
								/>
								<RewardCard
									position='2nd Place'
									reward='$250 Cash + Special Role'
									backgroundColor='from-gray-300 to-gray-400'
									icon={<Award className='w-8 h-8 text-gray-600' />}
								/>
								<RewardCard
									position='3rd Place'
									reward='$100 Cash + Special Role'
									backgroundColor='from-gray-800 to-gray-900'
									icon={<Medal className='w-8 h-8 text-gray-700' />}
								/>
							</>
						)}
					</div>
				</div>

				{/* Leaderboard Table */}
				<div>
					<div className='flex flex-col items-center justify-center mb-4'>
						<h2 className='text-xl font-semibold text-center text-[#000000] border-2 border-[#E0E0E0] rounded-md py-2 px-6 inline-block'>
							Monthly Leaderboard
						</h2>
						<p className='mt-2 text-sm text-[#000000]'>
							Period: {start_at} → {end_at}
						</p>
						<p className='mt-1 text-sm text-[#000000]'>{timeLeft}</p>
					</div>
					{isLoading ? (
						<div className='flex items-center justify-center h-64'>
							<Loader2 className='w-8 h-8 text-black animate-spin' />
						</div>
					) : (
						<LeaderboardTable period='monthly' data={monthlyLeaderboard} />
					)}
				</div>
			</main>

			<Footer />
		</div>
	);
}

interface RewardCardProps {
	position: string;
	reward: string;
	backgroundColor: string;
	player?: LeaderboardPlayer;
	icon?: React.ReactNode;
}

function RewardCard({
	position,
	reward,
	backgroundColor,
	player,
	icon,
}: RewardCardProps) {
	return (
		<div
			className='flex flex-col h-full overflow-hidden border border-[#E0E0E0] shadow-sm rounded-xl'
			style={{
				background: "linear-gradient(to right, var(--tw-gradient-stops))",
			}}
		>
			<div className={`h-2 bg-gradient-to-r ${backgroundColor}`} />
			<div className='flex flex-col items-center flex-grow p-6 text-center text-[#000000] bg-[#FFFFFF]'>
				<div className='mb-4'>{icon}</div>
				<h3 className='mb-2 text-xl font-bold'>{position}</h3>

				{player ? (
					<>
						<p className='font-medium'>{player.username}</p>
						<p className='text-black'>${player.wager.toLocaleString()}</p>
						<a
							href='https://discord.gg/YmvDexVt'
							target='_blank'
							rel='noreferrer'
							className='w-full mt-4'
						>
							<Button className='w-full bg-black hover:bg-gray-900 text-white'>
								Claim Prize
							</Button>
						</a>
					</>
				) : (
					<p className='text-black'>{reward}</p>
				)}
			</div>
		</div>
	);
}

export default LeaderboardPage;
