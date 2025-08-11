import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { Link } from "react-router-dom";
import { Dices, Crown, Gift, Users, ArrowRight } from "lucide-react";
import { useLeaderboardStore } from "@/store/useLeaderboardStore";
import { useSlotCallStore } from "@/store/useSlotCallStore";
import { useGiveawayStore } from "@/store/useGiveawayStore";
import GraphicalBackground from "@/components/GraphicalBackground";

function HomePage() {
	const { slotCalls } = useSlotCallStore();
	const { giveaways } = useGiveawayStore();
	const { monthlyLeaderboard, fetchLeaderboard } = useLeaderboardStore();

	const topLeaderboard = Array.isArray(monthlyLeaderboard)
		? monthlyLeaderboard.slice(0, 5)
		: [];

	const now = new Date();
	const monthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
	monthEndDate.setHours(23, 59, 59, 999);
	const monthEndISO = monthEndDate.toISOString();

	useEffect(() => {
		if (monthlyLeaderboard.length === 0) {
			fetchLeaderboard();
		}
	}, []);

	const [timeLeft, setTimeLeft] = useState("");

	useEffect(() => {
		const interval = setInterval(() => {
			const now = new Date();
			const end = new Date(monthEndISO);
			const diff = end.getTime() - now.getTime();

			if (diff <= 0) {
				setTimeLeft("00d : 00h : 00m : 00s");
				clearInterval(interval);
				return;
			}

			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
			const minutes = Math.floor((diff / (1000 * 60)) % 60);
			const seconds = Math.floor((diff / 1000) % 60);

			setTimeLeft(
				`${days.toString().padStart(2, "0")}d : ${hours
					.toString()
					.padStart(2, "0")}h : ${minutes
					.toString()
					.padStart(2, "0")}m : ${seconds.toString().padStart(2, "0")}s`
			);
		}, 1000);

		return () => clearInterval(interval);
	}, [monthEndISO]);

	return (
		<div className='relative flex flex-col min-h-screen text-white'>
			{/* 🎨 Animated Graphical Background */}
			<GraphicalBackground />

			<Navbar />

			<main className='relative z-10 flex-grow'>
				{/* Modern Hero Section with Kick Player Side-by-Side */}
				<section className='flex flex-col-reverse items-center justify-center max-w-6xl gap-16 px-6 mx-auto py-28 sm:flex-row sm:items-center'>
					{/* Text Content */}
					<div className='max-w-xl text-center sm:text-left'>
						<h1 className='text-5xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-[#E10600] via-[#B03400] to-[#E10600] bg-clip-text text-transparent drop-shadow-md'>
							MisterTee&apos;s <br /> Official Stream
						</h1>

						<div className='w-24 h-1 mt-6 rounded-full bg-[#E10600] animate-pulse' />

						<p className='mt-6 text-lg font-medium tracking-wide text-gray-300'>
							Watch MisterTee live on Kick — your go-to destination for
							thrilling gambling streams, giveaways, and more.
						</p>
					</div>

					{/* Kick Stream Embed */}
					<div className='w-full max-w-xl aspect-video rounded-3xl overflow-hidden shadow-lg border-4 border-[#E10600]'>
						<iframe
							src='https://player.kick.com/mistertee'
							frameBorder='0'
							allowFullScreen
							title='MisterTee Live Stream'
							className='w-full h-full'
						></iframe>
					</div>
				</section>

				{/* Metric-style Countdown Section */}
				<section className='max-w-4xl mx-auto px-6 py-10 rounded-3xl bg-black/70 border border-[#E10600] shadow-lg'>
					<h2 className='text-center text-3xl font-semibold mb-8 text-[#E10600] tracking-wide'>
						⏳ Monthly Leaderboard Ends In
					</h2>

					<div className='flex flex-col justify-center gap-6 text-center select-none sm:flex-row'>
						{["Days", "Hours", "Minutes", "Seconds"].map((label, idx) => {
							const timeParts = timeLeft.split(" : ");
							const value =
								timeParts.length === 4 ? timeParts[idx].slice(0, -1) : "--";

							return (
								<div
									key={label}
									className='flex flex-col items-center justify-center bg-[#E10600]/10 rounded-xl py-6 px-8 min-w-[80px] sm:min-w-[100px] shadow-sm'
								>
									<span className='text-5xl font-extrabold tracking-tight text-white'>
										{value}
									</span>
									<span className='mt-2 text-sm font-medium text-[#E10600]'>
										{label}
									</span>
								</div>
							);
						})}
					</div>
				</section>

				{/* Leaderboard */}
				<section className='container py-16'>
					<div className='flex items-center justify-between mb-8'>
						<div className='flex items-center gap-2'>
							<Crown className='w-6 h-6 text-[#E10600]' />
							<h2 className='text-2xl font-bold'>Monthly Leaderboard</h2>
						</div>
						<Button
							variant='outline'
							size='sm'
							className='border-[#E10600] text-[#E10600] hover:bg-[#E10600] hover:text-white bg-black'
							asChild
						>
							<Link to='/leaderboard' className='flex items-center gap-1'>
								View Full Leaderboard <ArrowRight className='w-4 h-4' />
							</Link>
						</Button>
					</div>
					<LeaderboardTable period='monthly' data={topLeaderboard} />
				</section>

				{/* Redesigned Features Section */}
				<section className='max-w-6xl px-6 py-16 mx-auto'>
					<h2 className='mb-12 text-4xl font-bold text-center text-white'>
						What We Offer
					</h2>
					<div className='grid grid-cols-1 gap-10 sm:grid-cols-3'>
						{[
							{
								icon: (
									<Dices className='w-12 h-12 text-[#E10600] animate-pulse' />
								),
								title: "Exciting Gambling Streams",
								description:
									"Watch thrilling slot sessions, casino games, and big win moments with MisterTee on Rainbet.",
							},
							{
								icon: (
									<Users className='w-12 h-12 text-[#E10600] animate-pulse' />
								),
								title: "Slot Call System",
								description:
									"Suggest slots for MisterTee to play during streams and see your suggestions come to life.",
							},
							{
								icon: (
									<Gift className='w-12 h-12 text-[#E10600] animate-pulse' />
								),
								title: "Regular Giveaways",
								description:
									"Participate in frequent giveaways for a chance to win cash, gaming gear, and more.",
							},
						].map(({ icon, title, description }) => (
							<div
								key={title}
								className='flex flex-col items-center bg-black/60 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-[#E10600] hover:scale-[1.05] transition-transform cursor-default'
							>
								<div className='flex items-center justify-center w-20 h-20 rounded-full bg-black/50 border-2 border-[#E10600] mb-6'>
									{icon}
								</div>
								<h3 className='text-xl font-semibold text-white mb-3 relative after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-14 after:h-[2px] after:bg-gradient-to-r after:from-[#E10600] after:to-[#B03400]'>
									{title}
								</h3>
								<p className='text-center text-gray-300'>{description}</p>
							</div>
						))}
					</div>
				</section>

				{/* Redesigned Schedule Section */}
				<section className='max-w-5xl px-6 py-16 mx-auto'>
					<h2 className='mb-8 text-4xl font-bold text-center text-white'>
						📅 Stream Schedule
					</h2>
					<p className='max-w-xl mx-auto mb-10 text-center text-gray-400'>
						MisterTee goes live <strong>every day</strong> — join the fun
						anytime!
					</p>

					{/* Timeline container */}
					<div className='relative items-center justify-between hidden max-w-full gap-8 px-4 mx-auto select-none sm:flex'>
						{/* Horizontal connecting line */}
						<div className='absolute top-1/2 left-8 right-8 h-1 bg-[#E10600]/30 rounded-full -z-10'></div>

						{[
							"Monday",
							"Tuesday",
							"Wednesday",
							"Thursday",
							"Friday",
							"Saturday",
							"Sunday",
						].map((day) => (
							<div
								key={day}
								className='flex flex-col items-center cursor-default group'
							>
								<div className='w-14 h-14 rounded-full border-4 border-[#E10600] bg-black/70 shadow-[0_0_12px_#E10600] group-hover:scale-110 transition-transform flex items-center justify-center text-[#E10600] font-semibold text-lg select-text'>
									{day.slice(0, 3)}
								</div>
								<p className='mt-3 text-sm text-gray-300 select-text'>
									7:30pm EST
								</p>
							</div>
						))}
					</div>

					{/* Mobile stacked schedule */}
					<div className='flex flex-col gap-4 sm:hidden'>
						{[
							"Monday",
							"Tuesday",
							"Wednesday",
							"Thursday",
							"Friday",
							"Saturday",
							"Sunday",
						].map((day) => (
							<div
								key={day}
								className='bg-black/60 rounded-xl border border-[#E10600] p-4 shadow-md flex justify-between items-center'
							>
								<span className='font-semibold text-[#E10600]'>{day}</span>
								<span className='text-gray-300'>7:30pm EST</span>
							</div>
						))}
					</div>

					<div className='flex justify-center mt-12'>
						<Button
							size='lg'
							className='bg-[#E10600] hover:bg-[#b00500] text-white shadow-lg transition'
							asChild
						>
							<a
								href='https://kick.com/MisterTee'
								target='_blank'
								rel='noreferrer'
							>
								Watch Live on Kick
							</a>
						</Button>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
}

export default HomePage;
