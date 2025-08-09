// 🎨 Color Palette:
// Black: #000000
// White: #FFFFFF
// Red: #E10600
// Light Gray: #D3D3D3

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
		<div className='flex flex-col min-h-screen bg-[#FFFFFF] text-[#000000]'>
			<Navbar />

			<main className='flex-grow'>
				{/* Hero Section */}
				<section className='relative overflow-hidden'>
					{/* Removed gradient and background overlays for full white */}
					<div className='container relative z-20 px-4 py-20 text-center md:py-28'>
						<h1 className='mb-4 text-4xl md:text-6xl font-bold text-[#000000]'>
							Welcome to MisterTee&apos;s
							<span className='block mt-2 text-[#E10600]'>
								Official Website
							</span>
						</h1>
						<p className='mb-8 text-lg text-[#000000] md:text-xl'>
							Join the community for exciting gambling streams, giveaways, slot
							calls, and leaderboard competitions with affiliate code{" "}
							<span className='font-bold text-[#E10600]'>MisterTee</span>
						</p>

						<div className='flex flex-col justify-center gap-4 sm:flex-row'>
							<Button
								size='lg'
								className='bg-[#E10600] hover:bg-[#b00500] text-white'
								asChild
							>
								<a
									href='https://kick.com/MisterTee'
									target='_blank'
									rel='noreferrer'
								>
									Watch Stream
								</a>
							</Button>
							<Button
								size='lg'
								variant='outline'
								className='border-[#E10600] text-[#E10600] hover:bg-[#E10600] hover:text-white'
								asChild
							>
								<a
									href='https://rainbet.com/?r=MisterTee'
									target='_blank'
									rel='noreferrer'
								>
									Join Rainbet with Code: MisterTee
								</a>
							</Button>
						</div>
					</div>
				</section>

				{/* Countdown Section */}
				<section className='flex justify-center py-12'>
					<div className='text-center border border-[#D3D3D3] rounded-lg px-6 py-6 bg-[#F5F5F5] shadow-md inline-flex flex-col items-center'>
						<h2 className='text-xl font-semibold text-[#000000] mb-4'>
							⏳ Leaderboard Ends In
						</h2>
						<p className='font-mono text-3xl text-[#E10600] tracking-widest select-none'>
							{timeLeft}
						</p>
						<p className='mt-2 text-sm text-[#000000]'>
							Keep playing to secure your rank!
						</p>
					</div>
				</section>

				{/* Leaderboard Section */}
				<section className='container py-16'>
					<div className='flex items-center justify-between mb-8'>
						<div className='flex items-center gap-2'>
							<Crown className='w-6 h-6 text-[#E10600]' />
							<h2 className='text-2xl font-bold text-[#000000]'>
								Monthly Leaderboard
							</h2>
						</div>
						<Button
							variant='outline'
							size='sm'
							className='border-[#E10600] text-[#E10600] hover:bg-[#E10600] hover:text-white'
							asChild
						>
							<Link to='/leaderboard' className='flex items-center gap-1'>
								View Full Leaderboard <ArrowRight className='w-4 h-4' />
							</Link>
						</Button>
					</div>

					<LeaderboardTable period='monthly' data={topLeaderboard} />
				</section>

				{/* Features */}
				<section className='bg-[#FFFFFF] border-y border-[#D3D3D3] py-16'>
					<div className='container text-center'>
						<h2 className='text-2xl font-bold text-[#000000] mb-12'>
							What We Offer
						</h2>
						<div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
							<FeatureCard
								icon={<Dices className='w-8 h-8 text-[#E10600]' />}
								title='Exciting Gambling Streams'
								description='Watch thrilling slot sessions, casino games, and big win moments with MisterTee on Rainbet.'
							/>
							<FeatureCard
								icon={<Users className='w-8 h-8 text-[#E10600]' />}
								title='Slot Call System'
								description='Suggest slots for MisterTee to play during streams and see your suggestions come to life.'
							/>
							<FeatureCard
								icon={<Gift className='w-8 h-8 text-[#E10600]' />}
								title='Regular Giveaways'
								description='Participate in frequent giveaways for a chance to win cash, gaming gear, and more.'
							/>
						</div>
					</div>
				</section>

				{/* 📅 Stream Schedule */}
				<section className='container py-16'>
					<h2 className='text-2xl font-bold text-[#000000] mb-8 text-center'>
						📅 Stream Schedule
					</h2>
					<p className='text-center mb-8 text-[#000000]'>
						MisterTee goes live <strong>every day</strong> — join the fun
						anytime!
					</p>
					<div className='grid grid-cols-2 gap-6 md:grid-cols-4'>
						{[
							"Monday",
							"Tuesday",
							"Wednesday",
							"Thursday",
							"Friday",
							"Saturday",
							"Sunday",
						].map((day) => (
							<ScheduleCard key={day} day={day} time='7:30pm EST' />
						))}
					</div>
					<div className='flex justify-center mt-8'>
						<Button
							size='lg'
							className='bg-[#E10600] hover:bg-[#b00500] text-white'
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

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<div className='bg-[#D3D3D3] p-6 rounded-2xl border border-[#D3D3D3] text-black shadow-md hover:shadow-lg transition'>
			<div className='flex justify-center mb-4'>{icon}</div>
			<h3 className='mb-2 text-xl font-bold'>{title}</h3>
			<p className='text-[#000000]'>{description}</p>
		</div>
	);
}

function ScheduleCard({ day, time }: { day: string; time: string }) {
	return (
		<div className='bg-[#D3D3D3] p-4 rounded-xl border border-[#D3D3D3] shadow-sm'>
			<h4 className='font-bold text-[#000000]'>{day}</h4>
			<p className='text-[#000000]'>{time}</p>
		</div>
	);
}

export default HomePage;
