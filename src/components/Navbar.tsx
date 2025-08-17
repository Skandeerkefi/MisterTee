import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Dices, Crown, Gift, Users, LogIn, User, LogOut } from "lucide-react";
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
		{ path: "/", name: "Home", icon: <Dices className='w-5 h-5' /> },
		{
			path: "/leaderboard",
			name: "Leaderboard",
			icon: <Crown className='w-5 h-5' />,
		},
		{
			path: "/slot-calls",
			name: "Slot Calls",
			icon: <Users className='w-5 h-5' />,
		},
		{
			path: "/giveaways",
			name: "Giveaways",
			icon: <Gift className='w-5 h-5' />,
		},
	];

	return (
		<nav className='sticky top-0 z-50 bg-black border-b border-gray-800 shadow-lg bg-opacity-90 backdrop-blur-md'>
			<div className='container flex items-center justify-between px-6 py-4 mx-auto'>
				{/* Logo */}
				<Link to='/' className='flex items-center space-x-3 select-none'>
					<img
						src='https://i.ibb.co/x8zPpn5p/Capture-d-cran-2025-08-08-180638.png'
						alt='MisterTee Logo'
						className='w-10 h-10 rounded-full border-2 border-[#E10600] shadow-sm object-cover'
					/>
					<span className='text-3xl font-extrabold italic tracking-wide text-[#E10600] [text-shadow:2px_2px_4px_black]'>
						Mister<span className='text-white'>Tee</span>
					</span>
				</Link>

				{/* Desktop Menu */}
				{!isMobile && (
					<div className='flex items-center space-x-10'>
						<ul className='flex space-x-8 font-medium text-white'>
							{menuItems.map((item) => (
								<li key={item.path}>
									<Link
										to={item.path}
										className={`flex items-center space-x-2 text-lg px-1 border-b-2 border-transparent transition-all duration-300 hover:border-[#E10600] ${
											location.pathname === item.path ? "border-[#E10600]" : ""
										}`}
									>
										{item.icon}
										<span>{item.name}</span>
									</Link>
								</li>
							))}
						</ul>

						{/* User controls */}
						<div className='flex items-center space-x-5'>
							{user ? (
								<>
									<Link
										to='/profile'
										className='flex items-center space-x-2 text-white hover:text-[#E10600] font-semibold'
									>
										<User className='w-5 h-5' />
										<span>{user.username}</span>
									</Link>
									<button
										onClick={logout}
										className='flex items-center space-x-2 bg-[#E10600] hover:bg-[#b00500] text-white px-4 py-1.5 rounded-md font-semibold transition'
									>
										<LogOut className='w-5 h-5' />
										<span>Logout</span>
									</button>
								</>
							) : (
								<>
									<Link
										to='/login'
										className='flex items-center space-x-2 border border-[#E10600] text-[#E10600] hover:bg-[#E10600] hover:text-white px-4 py-1.5 rounded-md font-semibold transition'
									>
										<LogIn className='w-5 h-5' />
										<span>Login</span>
									</Link>
									<Link
										to='/signup'
										className='text-white font-semibold hover:text-[#E10600] transition'
									>
										Sign Up
									</Link>
								</>
							)}
						</div>
					</div>
				)}

				{/* Live Status */}
				<div
					className={`ml-6 px-4 py-1 rounded-full text-sm font-bold select-none ${
						isLive
							? "bg-red-600 text-white shadow-lg animate-pulse"
							: "bg-gray-700 text-gray-300"
					}`}
					title={isLive ? "Currently Live" : "Offline"}
				>
					{isLive ? (
						<>
							<span role='img' aria-label='Live'>
								🔴
							</span>{" "}
							LIVE {viewerCount !== null ? `(${viewerCount})` : ""}
						</>
					) : (
						"Offline"
					)}
				</div>

				{/* Mobile Hamburger */}
				{isMobile && (
					<button
						onClick={() => setIsOpen(!isOpen)}
						aria-label='Toggle menu'
						aria-expanded={isOpen}
						className='relative z-50 w-8 h-8 flex flex-col justify-center items-center gap-1.5 focus:outline-none'
					>
						<span
							className={`block w-8 h-1 bg-white rounded transition-transform duration-300 ${
								isOpen ? "rotate-45 translate-y-2" : ""
							}`}
						/>
						<span
							className={`block w-8 h-1 bg-white rounded transition-opacity duration-300 ${
								isOpen ? "opacity-0" : "opacity-100"
							}`}
						/>
						<span
							className={`block w-8 h-1 bg-white rounded transition-transform duration-300 ${
								isOpen ? "-rotate-45 -translate-y-2" : ""
							}`}
						/>
					</button>
				)}
			</div>

			{/* Mobile Dropdown Menu */}
			{isMobile && (
				<div
					className={`fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
						isOpen
							? "opacity-100 pointer-events-auto"
							: "opacity-0 pointer-events-none"
					}`}
					onClick={() => setIsOpen(false)}
				>
					<div
						className={`absolute top-0 right-0 w-64 bg-[#111] h-full shadow-lg py-6 px-6 flex flex-col space-y-6 transform transition-transform duration-300 ${
							isOpen ? "translate-x-0" : "translate-x-full"
						}`}
						onClick={(e) => e.stopPropagation()}
					>
						<ul className='flex flex-col space-y-4 font-semibold text-white'>
							{menuItems.map((item) => (
								<li key={item.path}>
									<Link
										to={item.path}
										onClick={() => setIsOpen(false)}
										className={`flex items-center space-x-3 text-lg px-2 py-2 rounded-md hover:bg-[#E10600] hover:text-white transition-colors ${
											location.pathname === item.path ? "bg-[#E10600]" : ""
										}`}
									>
										{item.icon}
										<span>{item.name}</span>
									</Link>
								</li>
							))}
						</ul>

						<div className='mt-auto space-y-4'>
							{user ? (
								<>
									<Link
										to='/profile'
										onClick={() => setIsOpen(false)}
										className='flex items-center space-x-3 text-white text-lg font-semibold hover:text-[#E10600] transition'
									>
										<User className='w-6 h-6' />
										<span>{user.username}</span>
									</Link>
									<button
										onClick={() => {
											logout();
											setIsOpen(false);
										}}
										className='w-full bg-[#E10600] hover:bg-[#b00500] text-white py-2 rounded-md font-semibold transition'
									>
										<LogOut className='inline w-5 h-5 mr-2' />
										Logout
									</button>
								</>
							) : (
								<>
									<Link
										to='/login'
										onClick={() => setIsOpen(false)}
										className='flex items-center space-x-3 bg-[#E10600] hover:bg-[#b00500] text-white py-2 px-4 rounded-md font-semibold transition'
									>
										<LogIn className='w-5 h-5' />
										<span>Login</span>
									</Link>
									<Link
										to='/signup'
										onClick={() => setIsOpen(false)}
										className='block text-center text-white font-semibold hover:text-[#E10600] transition'
									>
										Sign Up
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</nav>
	);
}
