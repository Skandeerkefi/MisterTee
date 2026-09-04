import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import SlotCallsPage from "@/pages/SlotCallsPage";
import GiveawaysPage from "@/pages/GiveawaysPage";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/useAuthStore";
import SlotOverlay from "@/pages/SlotOverlay";
import BonusHuntPage from "@/pages/BonusHuntPage";
import RoobetPage from "@/pages/RoobetPage";
import RainPage from "@/pages/RainPage";
import CSGOLeadPage from "./pages/CSGOLead";
import PackdrawPage from "./pages/PackdrawPage";
import ClashLeaderboardPage from "./pages/ClashLeaderboardPage";
import DiamondPage from "@/pages/DiamondPage";
import CSBattleLeaderboardPage from "@/pages/CSBattleLeaderboardPage";
import AdminLeaderboardPage from "@/pages/AdminLeaderboardPage";
import JuiceLeaderboardPage from "@/pages/JuiceLeaderboardPage";

// New Community Hub Pages
import CoinFlipPage from "@/pages/CoinFlipPage";
import MinesPage from "@/pages/MinesPage";
import GamesPage from "@/pages/GamesPage";
import PointsShopPage from "@/pages/PointsShopPage";
import PointsLeaderboardPage from "@/pages/PointsLeaderboardPage";
import RewardsPage from "@/pages/RewardsPage";
import SocialsPage from "@/pages/SocialsPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPanelPage from "@/pages/AdminPanelPage";
import { getApiBaseUrl } from "@/lib/apiBase";

function AuthCallbackHandler() {
	const location = useLocation();
	const navigate = useNavigate();
	const setUser = useAuthStore((state) => state.setUser);
	const setToken = useAuthStore((state) => state.setToken);

	useEffect(() => {
		const token = new URLSearchParams(location.search).get("token");
		if (!token) return;

		fetch(`${getApiBaseUrl()}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
			.then((response) => {
				if (!response.ok) throw new Error("Invalid session");
				return response.json();
			})
			.then(({ user }) => {
				setToken(token);
				setUser(user);
				localStorage.setItem("token", token);
				localStorage.setItem("user", JSON.stringify(user));
				navigate(location.pathname, { replace: true });
			})
			.catch(() => navigate("/login?error=session", { replace: true }));
	}, [location.pathname, location.search, navigate, setToken, setUser]);

	return null;
}

function App() {
	const loadFromStorage = useAuthStore((state) => state.loadFromStorage);
	const user = useAuthStore((state) => state.user);

	useEffect(() => {
		loadFromStorage();
	}, [loadFromStorage]);

	return (
		<TooltipProvider>
			<BrowserRouter>
				<AuthCallbackHandler />
				<Routes>
					{/* Existing routes */}
					<Route path='/' element={<HomePage />} />
					<Route path='/leaderboard' element={<CSGOLeadPage />} />
					<Route path='/slot-calls' element={<SlotCallsPage />} />
					<Route path='/giveaways' element={<GiveawaysPage />} />
					<Route path='/login' element={<LoginPage />} />
					<Route path='*' element={<NotFoundPage />} />
					<Route path='/slot-overlay' element={<SlotOverlay />} />
					<Route path='/bonus-hunt' element={<BonusHuntPage />} />
					<Route path='/Leaderboards' element={<RoobetPage />} />
					<Route path='/rain' element={<RainPage />} />
					<Route path='/clash' element={<ClashLeaderboardPage />} />
					<Route path='/packdraw' element={<PackdrawPage />} />
					<Route path='/diamonds' element={<DiamondPage />} />
					<Route path='/csbattle' element={<CSBattleLeaderboardPage />} />
					<Route path='/juice' element={<JuiceLeaderboardPage />} />
					<Route path='/admin/leaderboards' element={<AdminLeaderboardPage />} />

					{/* NEW Community Hub Routes */}
					<Route path='/games/coinflip' element={<CoinFlipPage />} />
					<Route path='/games/mines' element={<MinesPage />} />
					<Route path='/games' element={<GamesPage />} />
					<Route path='/shop' element={<PointsShopPage />} />
					<Route path='/points-leaderboard' element={<PointsLeaderboardPage />} />
					<Route path='/rewards' element={<RewardsPage />} />
					<Route path='/socials' element={<SocialsPage />} />
					<Route path='/profile' element={<ProfilePage />} />
					<Route path='/admin/panel' element={<AdminPanelPage />} />
				</Routes>
			</BrowserRouter>
			<Toaster />
		</TooltipProvider>
	);
}

export default App;
