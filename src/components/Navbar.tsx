import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

function ShirtIcon({ color, accentColor, label }: { color: string; accentColor: string; label: string }) {
  return (
    <svg viewBox="0 0 60 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-9 sm:h-11 sm:w-10 lg:h-12 lg:w-11">
      <path d="M30 4V1M30 8V14M6 13h48" stroke="#4A5568" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 20 6 32h8v32q0 2 2 2h28q2 0 2-2V32h8l-4-12-12-2q-2-6-8-6t-8 6z" fill={color} stroke="#303747" strokeWidth="1" />
      <path d="M22 18q2-6 8-6t8 6" fill={color} stroke="#303747" strokeWidth="1" />
      <path d="M24 18q2-4 6-4t6 4" fill="#0D1017" opacity=".75" />
      <path d="M10 20 14 24M50 20 46 24" stroke={accentColor} strokeWidth="1" opacity=".5" />
      <text x="30" y="43" textAnchor="middle" fill={accentColor} fontSize="4.2" fontWeight="700" letterSpacing=".35">{label.slice(0, 8).toUpperCase()}</text>
      <circle cx="30" cy="51" r="2.2" fill="none" stroke={accentColor} strokeWidth=".7" opacity=".8" />
      <path d="M28.5 51h3M30 49.5v3" stroke={accentColor} strokeWidth=".45" opacity=".8" />
    </svg>
  );
}

interface ShirtItemProps { to: string; label: string; isActive: boolean; }
function ShirtItem({ to, label, isActive }: ShirtItemProps) {
  return <Link to={to} title={label} className="relative flex flex-col items-center justify-end px-1 py-1 select-none group shrink-0 snap-start">
    <div className={`pointer-events-none absolute inset-x-0 top-0 h-12 rounded-full bg-[#8B5CF6]/20 blur-xl transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"}`} />
    <div className={`relative transition duration-300 ${isActive ? "-translate-y-1 scale-110" : "group-hover:-translate-y-1 group-hover:rotate-1 group-hover:scale-105"}`}>
      <ShirtIcon label={label} color={isActive ? "#242039" : "#121620"} accentColor={isActive ? "#A78BFA" : "#657087"} />
      {isActive && <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#8B5CF6] shadow-glow-sm" />}
    </div>
    <span className={`mt-0.5 text-[7px] font-semibold uppercase tracking-[0.11em] transition-colors sm:text-[8px] lg:text-[9px] whitespace-nowrap ${isActive ? "text-[#A78BFA]" : "text-[#667084] group-hover:text-[#F5F7FA]"}`}>{label}</span>
  </Link>;
}

function LeaderboardItem({ isActive, open, onToggle, onNavigate }: { isActive: boolean; open: boolean; onToggle: () => void; onNavigate: () => void }) {
  return <div className="relative flex flex-col items-center justify-end px-1 py-1 shrink-0 snap-start">
    <button type="button" onClick={onToggle} title="Choose leaderboard" className="relative flex flex-col items-center justify-end select-none group">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-12 rounded-full bg-[#8B5CF6]/20 blur-xl transition-opacity ${isActive || open ? "opacity-100" : "opacity-0 group-hover:opacity-70"}`} />
      <div className={`relative transition duration-300 ${isActive || open ? "-translate-y-1 scale-110" : "group-hover:-translate-y-1 group-hover:rotate-1 group-hover:scale-105"}`}>
        <ShirtIcon label="Leaderboard" color={isActive || open ? "#242039" : "#121620"} accentColor={isActive || open ? "#A78BFA" : "#657087"} />
        {(isActive || open) && <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#8B5CF6] shadow-glow-sm" />}
      </div>
      <span className={`mt-0.5 text-[7px] font-semibold uppercase tracking-[0.11em] transition-colors sm:text-[8px] lg:text-[9px] whitespace-nowrap ${isActive || open ? "text-[#A78BFA]" : "text-[#667084] group-hover:text-[#F5F7FA]"}`}>Leaderboard</span>
    </button>
    {open && <div className="absolute left-1/2 top-full z-50 mt-2 w-40 -translate-x-1/2 overflow-hidden rounded-xl border border-[#252B38] bg-[#121620] p-1 shadow-card-dark">
      {[{ to: "/Leaderboards", label: "Roobet" }, { to: "/leaderboard", label: "CSGOWIN" }, { to: "/juice", label: "Juice" }].map((board) => <Link key={board.to} to={board.to} onClick={onNavigate} className="block rounded-lg px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[#8B93A3] hover:bg-[#8B5CF6]/15 hover:text-[#A78BFA]">{board.label}</Link>)}
    </div>}
  </div>;
}

const NAV_ITEMS = [
  { to: "/rewards", label: "Rewards" }, { to: "/juice", label: "Leaderboard" }, { to: "/socials", label: "Social" },
  { to: "/games", label: "Games" }, { to: "/shop", label: "Shop" }, { to: "/points-leaderboard", label: "Points" },
  { to: "/slot-calls", label: "Slot Calls" },
  { to: "/giveaways", label: "Giveaways" },
];

export function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isLive, setIsLive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const items = [...NAV_ITEMS, ...(user ? [{ to: "/profile", label: "Profile" }] : []), ...(user?.role === "admin" ? [{ to: "/admin/panel", label: "Admin Panel" }, { to: "/admin/leaderboards", label: "Admin Leaderboard" }] : [])];
  useEffect(() => {
    const checkLive = async () => { try { const r = await fetch("https://kick.com/api/v2/channels/MisterTee"); const d = await r.json(); setIsLive(!!d.livestream); } catch { setIsLive(false); } };
    checkLive(); const id = setInterval(checkLive, 60000); return () => clearInterval(id);
  }, []);
  useEffect(() => { setLeaderboardOpen(false); setMenuOpen(false); }, [location.pathname]);
  const isActive = (path: string) => path === "/juice" ? ["/juice","/leaderboards","/leaderboard"].includes(location.pathname.toLowerCase()) : path === "/games" ? location.pathname.startsWith("/games") : location.pathname === path;
  return <nav className="sticky top-0 z-50 w-full border-b border-[#252B38] bg-[#0D1017]/95 shadow-[0_8px_30px_rgba(0,0,0,.25)] backdrop-blur-xl">
    <div className="mx-auto flex min-h-[60px] max-w-[1440px] items-center gap-2 px-3 sm:min-h-[76px] sm:gap-4 sm:px-6">
      <Link to="/" className="flex items-center gap-2 group shrink-0 sm:gap-3" onClick={() => setMenuOpen(false)}>
        <img src="https://i.ibb.co/d99mRqd/Screenshot-2026-09-04-122248.png" alt="MisterTee" className="h-9 w-9 rounded-full border border-[#252B38] group-hover:border-[#8B5CF6] sm:h-11 sm:w-11" />
        <span className="font-display text-lg font-bold tracking-wide text-[#F5F7FA] sm:text-2xl">Mister<span className="text-[#8B5CF6]">Tee</span></span>
      </Link>
      <div className="items-end justify-center flex-1 hidden min-w-0 gap-2 py-2 mx-auto overflow-visible sm:gap-3 lg:flex lg:gap-4">
        {items.map((item) => item.label === "Leaderboard" ? <LeaderboardItem key={item.to} isActive={isActive(item.to)} open={leaderboardOpen} onToggle={() => setLeaderboardOpen(!leaderboardOpen)} onNavigate={() => setLeaderboardOpen(false)} /> : <ShirtItem key={item.to} to={item.to} label={item.label} isActive={isActive(item.to)} />)}
      </div>
      <div className="flex items-center gap-2 ml-auto shrink-0 lg:ml-0">
        {isLive && <span className="hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#A78BFA] xl:flex"><span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />Live</span>}
        {user ? <div className="relative"><button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 rounded-lg border border-[#252B38] bg-[#121620] px-2 py-1.5 hover:border-[#8B5CF6]/60 sm:px-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8B5CF6]/20 text-xs font-bold text-[#A78BFA]">{user.kickUsername?.[0]?.toUpperCase() || "U"}</span><span className="hidden max-w-20 truncate text-xs font-medium text-[#F5F7FA] sm:block sm:text-sm">{user.kickUsername}</span></button>{showUserMenu && <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-[#252B38] bg-[#121620] shadow-card-dark"><Link to="/profile" onClick={() => setShowUserMenu(false)} className="block px-4 py-3 text-sm text-[#8B93A3] hover:bg-[#181D27] hover:text-white">Profile</Link>{user.role === "admin" && <><Link to="/admin/panel" onClick={() => setShowUserMenu(false)} className="block px-4 py-3 text-sm text-[#A78BFA] hover:bg-[#181D27]">Admin Panel</Link><Link to="/admin/leaderboards" onClick={() => setShowUserMenu(false)} className="block px-4 py-3 text-sm text-[#A78BFA] hover:bg-[#181D27]">Leaderboard Settings</Link></>}<button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full border-t border-[#252B38] px-4 py-3 text-left text-sm text-red-400 hover:bg-[#181D27]">Logout</button></div>}</div> : <Link to="/login" className="hidden px-3 py-2 text-xs font-semibold rounded-lg btn-accent sm:inline-flex lg:px-4">Sign in with Kick</Link>}
        <button onClick={() => setMenuOpen(!menuOpen)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#252B38] bg-[#121620] text-[#8B93A3] transition hover:border-[#8B5CF6]/60 hover:text-white lg:hidden" aria-label="Toggle navigation">{menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div>
    </div>
    <div className="border-t border-[#252B38]/60 bg-[#08090D]/80 backdrop-blur lg:hidden">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide px-1 py-1.5 snap-x snap-mandatory sm:px-3 sm:py-2">
        {items.map((item) => item.label === "Leaderboard" ? <ShirtItem key={item.to} to="/juice" label="Leaderboard" isActive={isActive("/juice")} /> : <ShirtItem key={item.to} to={item.to} label={item.label} isActive={isActive(item.to)} />)}
      </div>
    </div>
    {menuOpen && <div className="border-t border-[#252B38] bg-[#0D1017] p-3 lg:hidden max-h-[70vh] overflow-y-auto">
      <div className="grid gap-1">
        {!user && <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-lg btn-accent sm:hidden">Sign in with Kick</Link>}
        {isLive && <div className="flex items-center gap-2 rounded-lg bg-[#8B5CF6]/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-[#A78BFA]"><span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" /> Live on Kick</div>}
        <p className="px-2 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5F6878]">Navigate</p>
        {items.map((item) => item.label === "Leaderboard" ? <div key={item.to} className="rounded-xl bg-[#121620] p-1"><p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#A78BFA]">Leaderboards</p>{[{ to: "/Leaderboards", label: "Roobet" }, { to: "/leaderboard", label: "CSGOWIN" }, { to: "/juice", label: "Juice" }].map((b) => <Link key={b.to} to={b.to} onClick={() => setMenuOpen(false)} className={`block rounded-lg px-4 py-2.5 text-sm ${location.pathname.toLowerCase()===b.to.toLowerCase()?"bg-[#8B5CF6]/15 text-[#A78BFA]":"text-[#8B93A3] hover:bg-[#181D27] hover:text-white"}`}>{b.label}</Link>)}</div> : <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={`block rounded-xl px-4 py-3 text-sm font-medium ${isActive(item.to)?"bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/20":"bg-[#121620] text-[#8B93A3] hover:bg-[#181D27] hover:text-white border border-transparent"}`}>{item.label}</Link>)}
      </div>
    </div>}
  </nav>;
}
