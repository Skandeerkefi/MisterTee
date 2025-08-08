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

	// Calculate current month end date string for countdown
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
		<div className='flex flex-col min-h-screen bg-[#161A34] text-white'>
			<Navbar />

			<main className='flex-grow'>
				{/* Hero Section */}
				<section className='relative overflow-hidden'>
					<div className='absolute inset-0 bg-gradient-to-br from-[#161A34]/90 to-[#161A34]/70 z-10' />
					<div
						className='absolute inset-0 z-0 bg-center bg-cover opacity-30'
						style={{
							backgroundImage:
								"url(https://images.unsplash.com/photo-1614585507279-e3dda7937fdf?w=1200&h=600&fit=crop)",
						}}
					/>

					<div className='container relative z-20 px-4 py-20 text-center md:py-28'>
						<h1 className='mb-4 text-4xl md:text-6xl font-bold text-[#38BDF8]'>
							Welcome to MONEYLIFE1K's
							<span className='block mt-2 text-[#CF9F86]'>
								Official Website
							</span>
						</h1>
						<p className='mb-8 text-lg text-white md:text-xl'>
							Join the community for exciting gambling streams, giveaways, slot
							calls, and leaderboard competitions with affiliate code{" "}
							<span className='font-bold text-[#38BDF8]'>MONEYLIFE</span>
						</p>

						<div className='flex flex-col justify-center gap-4 sm:flex-row'>
							<Button
								size='lg'
								className='bg-[#38BDF8] hover:bg-[#2DA2D2] text-white'
								asChild
							>
								<a
									href='https://kick.com/MONEYLIFE1K'
									target='_blank'
									rel='noreferrer'
								>
									Watch Stream
								</a>
							</Button>
							<Button
								size='lg'
								variant='outline'
								className='border-[#38BDF8] text-[#38BDF8] hover:bg-[#38BDF8] hover:text-white'
								asChild
							>
								<a
									href='https://rainbet.com/?r=MONEYLIFE'
									target='_blank'
									rel='noreferrer'
								>
									Join Rainbet with Code: MONEYLIFE
								</a>
							</Button>
						</div>
					</div>
				</section>

				{/* Countdown Section */}
				<section className='flex justify-center py-12'>
					<div className='text-center border border-[#CF9F86] rounded-lg px-6 py-6 bg-[#1E2547] shadow-md inline-flex flex-col items-center'>
						<h2 className='text-xl font-semibold text-[#CF9F86] mb-4'>
							⏳ Leaderboard Ends In
						</h2>
						<p className='font-mono text-3xl text-[#38BDF8] tracking-widest select-none'>
							{timeLeft}
						</p>
						<p className='mt-2 text-sm text-white/80'>
							Keep playing to secure your rank!
						</p>
					</div>
				</section>

				{/* Leaderboard Section */}
				<section className='container py-16'>
					<div className='flex items-center justify-between mb-8'>
						<div className='flex items-center gap-2'>
							<Crown className='w-6 h-6 text-[#38BDF8]' />
							<h2 className='text-2xl font-bold text-[#38BDF8]'>
								Monthly Leaderboard
							</h2>
						</div>
						<Button
							variant='outline'
							size='sm'
							className='border-[#38BDF8] text-[#38BDF8] hover:bg-[#38BDF8] hover:text-white'
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
				<section className='bg-[#161A34] border-y border-[#38BDF8]/20 py-16'>
					<div className='container text-center'>
						<h2 className='text-2xl font-bold text-[#38BDF8] mb-12'>
							What We Offer
						</h2>
						<div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
							<FeatureCard
								icon={<Dices className='w-8 h-8 text-[#CF9F86]' />}
								title='Exciting Gambling Streams'
								description='Watch thrilling slot sessions, casino games, and big win moments with MONEYLIFE1K on Rainbet.'
							/>
							<FeatureCard
								icon={<Users className='w-8 h-8 text-[#CF9F86]' />}
								title='Slot Call System'
								description='Suggest slots for MONEYLIFE1K to play during streams and see your suggestions come to life.'
							/>
							<FeatureCard
								icon={<Gift className='w-8 h-8 text-[#CF9F86]' />}
								title='Regular Giveaways'
								description='Participate in frequent giveaways for a chance to win cash, gaming gear, and more.'
							/>
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
}

interface FeatureCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
	return (
		<div className='bg-[#1E2547] p-6 rounded-2xl border border-[#38BDF8]/20 text-white shadow-md hover:shadow-xl transition'>
			<div className='flex justify-center mb-4 text-[#CF9F86]'>{icon}</div>
			<h3 className='text-xl font-bold text-[#CF9F86] mb-2'>{title}</h3>
			<p className='text-white/80'>{description}</p>
		</div>
	);
}

export default HomePage;
