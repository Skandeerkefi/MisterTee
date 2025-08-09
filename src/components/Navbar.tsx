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
				const res = await fetch("https://kick.com/api/v2/channels/MisterTee");
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
		<nav className='sticky top-0 z-50 border-b border-[#D3D3D3] backdrop-blur-md bg-[#FFFFFF] text-[#000000] shadow-md'>
			<div className='container flex items-center justify-between py-3 mx-auto'>
				<div className='flex items-center gap-3'>
					<Link to='/' className='flex items-center gap-2'>
						<img
							src='https://media.discordapp.net/attachments/1398864689559109784/1402771759824109619/48877C4C-038D-458E-B111-4B92E934384E.jpg?ex=68971ac1&is=6895c941&hm=4050594e1db8907b87742b68b80ea6184c0ce367744e30760e411ae42027a3b9&=&format=webp&width=686&height=845'
							alt='MisterTee Logo'
							className='object-cover w-10 h-10 border rounded-full shadow-sm border-[#D3D3D3]'
						/>
						<span className='text-2xl font-bold select-none'>MisterTee</span>
					</Link>

					{isLive ? (
						<span className='ml-2 px-3 py-0.5 text-xs bg-[#E10600] text-white rounded-full font-semibold animate-pulse select-none'>
							🔴 LIVE {viewerCount !== null ? `(${viewerCount})` : ""}
						</span>
					) : (
						<span className='ml-2 px-3 py-0.5 text-xs bg-[#D3D3D3] text-black rounded-full font-semibold select-none'>
							Offline
						</span>
					)}
				</div>

				{/* Desktop Menu */}
				<div className={`${isMobile ? "hidden" : "flex items-center gap-6"}`}>
					<div className='flex items-center gap-3'>
						{menuItems.map((item) => (
							<Link
								key={item.path}
								to={item.path}
								className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
									location.pathname === item.path
										? "bg-[#000000] text-white shadow-md"
										: "text-black hover:bg-[#D3D3D3] hover:text-black"
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
										className='flex items-center gap-1 font-semibold text-black'
									>
										<User className='w-4 h-4' />
										{user.username}
									</Link>
								</Button>
								<Button
									variant='outline'
									size='sm'
									onClick={logout}
									className='text-white border-[#000000] bg-[#E10600] hover:bg-[#000000] hover:text-white'
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
									className='text-white border-[#000000] bg-[#E10600] hover:bg-[#000000] hover:text-white'
								>
									<Link to='/login' className='flex items-center'>
										<LogIn className='w-4 h-4 mr-1' />
										Login
									</Link>
								</Button>
								<Button
									size='sm'
									asChild
									className='font-semibold text-black hover:text-[#E10600]'
								>
									<Link to='/signup'>Sign Up</Link>
								</Button>
							</>
						)}
					</div>
				</div>

				{/* Mobile Hamburger */}
				{isMobile && (
					<button
						className='p-2 rounded-md hover:bg-[#D3D3D3] focus:outline-none focus:ring-2 focus:ring-[#000000]'
						onClick={() => setIsOpen(!isOpen)}
						aria-label='Toggle menu'
						aria-expanded={isOpen}
					>
						<div className='space-y-1.5'>
							<span
								className={`block h-0.5 w-6 bg-black transition-all duration-300 ${
									isOpen ? "rotate-45 translate-y-2" : ""
								}`}
							/>
							<span
								className={`block h-0.5 w-6 bg-black transition-all duration-300 ${
									isOpen ? "opacity-0" : "opacity-100"
								}`}
							/>
							<span
								className={`block h-0.5 w-6 bg-black transition-all duration-300 ${
									isOpen ? "-rotate-45 -translate-y-2" : ""
								}`}
							/>
						</div>
					</button>
				)}
			</div>

			{/* Mobile Dropdown */}
			{isMobile && (
				<div
					className={`container mx-auto overflow-hidden transition-all duration-300 ease-in-out ${
						isOpen ? "max-h-screen py-3 border-t border-[#D3D3D3]" : "max-h-0"
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
										? "bg-[#000000] text-white"
										: "text-black hover:bg-[#D3D3D3] hover:text-black"
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
											className='flex items-center font-semibold text-black'
										>
											<User className='w-4 h-4 mr-1' />
											{user.username}
										</Link>
									</Button>
									<Button
										variant='outline'
										size='sm'
										className='w-full text-white border-[#000000] bg-[#E10600] hover:bg-[#000000] hover:text-white'
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
										className='w-full text-white border-[#000000] bg-[#E10600] hover:bg-[#000000] hover:text-white'
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
										className='w-full font-semibold text-black hover:text-[#E10600]'
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
