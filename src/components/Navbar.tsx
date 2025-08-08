import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dices, Crown, Gift, Users, LogIn, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import useMediaQuery from "@/hooks/use-media-query";
import { useAuthStore } from "@/store/useAuthStore";

export function Navbar() {
	const location = useLocation();
	const isMobile = useMediaQuery("(max-width: 768px)");
	const [isOpen, setIsOpen] = useState(false);
	const [isLive, setIsLive] = useState(false);
	const [viewerCount, setViewerCount] = useState<number | null>(null);

	const { user, logout } = useAuthStore();

	useEffect(() => {
		setIsOpen(false);
	}, [location, isMobile]);

	useEffect(() => {
		const fetchLiveStatus = async () => {
			try {
				const res = await fetch("https://kick.com/api/v2/channels/MONEYLIFE1K");
				const data = await res.json();

				if (data.livestream) {
					setIsLive(true);
					setViewerCount(data.livestream.viewer_count);
				} else {
					setIsLive(false);
					setViewerCount(null);
				}
			} catch (err) {
				console.error("Error fetching live status", err);
			}
		};

		fetchLiveStatus();
		const interval = setInterval(fetchLiveStatus, 60000);
		return () => clearInterval(interval);
	}, []);

	const menuItems = [
		{ path: "/", name: "Home", icon: <Dices className='w-4 h-4 mr-1' /> },
		{
			path: "/leaderboard",
			name: "Leaderboard",
			icon: <Crown className='w-4 h-4 mr-1' />,
		},
		{
			path: "/slot-calls",
			name: "Slot Calls",
			icon: <Users className='w-4 h-4 mr-1' />,
		},
		{
			path: "/giveaways",
			name: "Giveaways",
			icon: <Gift className='w-4 h-4 mr-1' />,
		},
	];

	return (
		<nav className='sticky top-0 z-50 border-b border-[#CF9F86]/40 backdrop-blur-md bg-[#161A34]/95 text-white shadow-md'>
			<div className='container flex items-center justify-between py-3 mx-auto'>
				<div className='flex items-center gap-3'>
					<Link to='/' className='flex items-center gap-2'>
						<img
							src='https://files.kick.com/images/user/39074313/profile_image/conversion/56920648-3c8c-46b9-b833-bbd1f5fa2b18-fullsize.webp'
							alt='MONEYLIFE1K Logo'
							className='object-cover w-10 h-10 border rounded-full shadow-sm border-[#CF9F86]/60'
						/>
						<span className='text-2xl font-bold text-[#38BDF8] select-none'>
							Moneylife1k
						</span>
					</Link>

					{isLive ? (
						<span className='ml-2 px-3 py-0.5 text-xs bg-[#38BDF8] text-white rounded-full font-semibold animate-pulse select-none'>
							🔴 LIVE {viewerCount !== null ? `(${viewerCount})` : ""}
						</span>
					) : (
						<span className='ml-2 px-3 py-0.5 text-xs bg-[#CF9F86] text-white rounded-full font-semibold select-none'>
							Offline
						</span>
					)}
				</div>

				<div className={`${isMobile ? "hidden" : "flex items-center gap-6"}`}>
					<div className='flex items-center gap-3'>
						{menuItems.map((item) => (
							<Link
								key={item.path}
								to={item.path}
								className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
									location.pathname === item.path
										? "bg-[#38BDF8] text-white shadow-md"
										: "text-white hover:bg-[#CF9F86] hover:text-white"
								}`}
							>
								{item.icon}
								{item.name}
							</Link>
						))}
					</div>

					<div className='flex items-center gap-3'>
						{user ? (
							<>
								<Button variant='ghost' size='sm' asChild>
									<Link
										to='/'
										className='flex items-center gap-1 font-semibold text-white'
									>
										<User className='w-4 h-4' />
										{user.username}
									</Link>
								</Button>
								<Button
									variant='outline'
									size='sm'
									onClick={logout}
									className='border-white text-white hover:bg-[#38BDF8] hover:border-[#38BDF8]'
								>
									<LogOut className='w-4 h-4 mr-1' />
									Logout
								</Button>
							</>
						) : (
							<>
								<Button
									variant='outline'
									size='sm'
									asChild
									className='border-white text-white hover:bg-[#CF9F86] hover:border-[#CF9F86]'
								>
									<Link to='/login' className='flex items-center'>
										<LogIn className='w-4 h-4 mr-1' />
										Login
									</Link>
								</Button>
								<Button
									size='sm'
									asChild
									className='text-white hover:text-[#38BDF8] font-semibold'
								>
									<Link to='/signup'>Sign Up</Link>
								</Button>
							</>
						)}
					</div>
				</div>

				{isMobile && (
					<button
						className='p-2 rounded-md hover:bg-[#CF9F86]/30 focus:outline-none focus:ring-2 focus:ring-[#CF9F86]'
						onClick={() => setIsOpen(!isOpen)}
						aria-label='Toggle menu'
						aria-expanded={isOpen}
					>
						<div className='space-y-1.5'>
							<span
								className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
									isOpen ? "rotate-45 translate-y-2" : ""
								}`}
							/>
							<span
								className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
									isOpen ? "opacity-0" : "opacity-100"
								}`}
							/>
							<span
								className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
									isOpen ? "-rotate-45 -translate-y-2" : ""
								}`}
							/>
						</div>
					</button>
				)}
			</div>

			{isMobile && (
				<div
					className={`container mx-auto overflow-hidden transition-all duration-300 ease-in-out ${
						isOpen
							? "max-h-screen py-3 border-t border-[#CF9F86]/40"
							: "max-h-0"
					}`}
				>
					<div className='flex flex-col gap-2 pb-4'>
						{menuItems.map((item) => (
							<Link
								key={item.path}
								to={item.path}
								onClick={() => setIsOpen(false)}
								className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
									location.pathname === item.path
										? "bg-[#38BDF8] text-white"
										: "text-white hover:bg-[#CF9F86] hover:text-white"
								}`}
							>
								{item.icon}
								{item.name}
							</Link>
						))}

						<div className='flex flex-col gap-2 mt-3'>
							{user ? (
								<>
									<Button variant='ghost' size='sm' className='w-full' asChild>
										<Link
											to='/profile'
											onClick={() => setIsOpen(false)}
											className='flex items-center font-semibold text-white'
										>
											<User className='w-4 h-4 mr-1' />
											{user.username}
										</Link>
									</Button>
									<Button
										variant='outline'
										size='sm'
										className='w-full border-white text-white hover:bg-[#38BDF8] hover:border-[#38BDF8]'
										onClick={() => {
											logout();
											setIsOpen(false);
										}}
									>
										<LogOut className='w-4 h-4 mr-1' />
										Logout
									</Button>
								</>
							) : (
								<>
									<Button
										variant='outline'
										size='sm'
										className='w-full border-white text-white hover:bg-[#CF9F86] hover:border-[#CF9F86]'
										asChild
									>
										<Link
											to='/login'
											onClick={() => setIsOpen(false)}
											className='flex items-center'
										>
											<LogIn className='w-4 h-4 mr-1' />
											Login
										</Link>
									</Button>
									<Button
										size='sm'
										className='w-full text-white hover:text-[#38BDF8] font-semibold'
										asChild
									>
										<Link to='/signup' onClick={() => setIsOpen(false)}>
											Sign Up
										</Link>
									</Button>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</nav>
	);
}
