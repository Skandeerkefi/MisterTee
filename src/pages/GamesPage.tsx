import { ArrowRight, Bomb, CircleDollarSign, Spade } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import GraphicalBackground from "@/components/GraphicalBackground";

const games = [
  { name: "Coin Flip", label: "50 / 50", description: "Choose heads or tails and double your points when the call lands.", to: "/games/coinflip", icon: CircleDollarSign, accent: "#A78BFA" },
  { name: "Mines 5x5", label: "High risk", description: "Pick a tile, chase the multiplier, and avoid the hidden mines.", to: "/games/mines", icon: Bomb, accent: "#22D3EE" },
  { name: "Blackjack", label: "Classic", description: "Beat the dealer to 21. 3:2 on blackjack. Double, split, and surrender available.", to: "/games/blackjack", icon: Spade, accent: "#34D399" },
];

export default function GamesPage() {
  return <div className="relative flex min-h-screen flex-col text-white"><GraphicalBackground /><Navbar /><main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12"><p className="section-kicker text-center">Points arcade</p><h1 className="mt-2 text-center font-display text-3xl sm:text-4xl lg:text-5xl font-bold">Choose your game</h1><p className="mx-auto mt-3 max-w-xl text-center text-[#8B93A3]">Use your points to play. Every wager and payout is recorded in your account ledger.</p><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{games.map(({ name, label, description, to, icon: Icon, accent }) => <Link key={to} to={to} className="group surface-panel relative min-h-[180px] sm:min-h-64 overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:border-[#8B5CF6]/70"><div className="absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-25" style={{ background: accent }} /><div className="relative flex h-full flex-col justify-between"><div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#252B38] bg-[#0D1017]" style={{ color: accent }}><Icon className="h-5 w-5" /></span><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5F6878]">{label}</span></div><div><h2 className="font-display text-2xl font-bold text-[#F5F7FA] group-hover:text-[#A78BFA]">{name}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#8B93A3]">{description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#A78BFA]">Play now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></div></div></Link>)}</div></main><Footer /></div>;
}


