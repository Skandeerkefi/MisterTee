import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Crown, Dices, Gift, Play, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLeaderboardStore } from "@/store/useLeaderboardStore";
import GraphicalBackground from "@/components/GraphicalBackground";

const destinations = [
  { icon: Dices, label: "Games", title: "Play the board", copy: "Coinflip, blackjack, mines and more, with your points on the line.", to: "/games" },
  { icon: Crown, label: "Leaderboard", title: "Earn your place", copy: "Climb the monthly rankings and make your run impossible to ignore.", to: "/juice" },
  { icon: Gift, label: "Rewards", title: "Unlock access", copy: "Partner drops, community perks and rewards reserved for members.", to: "/rewards" },
  { icon: Users, label: "Social", title: "Stay connected", copy: "Find the stream, the chat and the next moment before it happens.", to: "/socials" },
];

function HomePage() {
  const { monthlyLeaderboard, fetchLeaderboard } = useLeaderboardStore();

  useEffect(() => {
    if (monthlyLeaderboard.length === 0) fetchLeaderboard();
  }, [fetchLeaderboard, monthlyLeaderboard.length]);

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden text-white">
      <GraphicalBackground />
      <Navbar />
      <main className="relative z-10 flex-grow">
        <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:gap-12 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-28">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#A78BFA] sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_12px_#22D3EE]" />
              The community is live
            </div>
            <h1 className="font-display text-4xl font-bold leading-[0.98] tracking-tight text-[#F5F7FA] sm:text-5xl lg:text-7xl">Your crew.<br /><span className="text-gradient-accent">Your arena.</span></h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#8B93A3] sm:mt-7 sm:text-lg sm:leading-8">MisterTee is a premium gambling community for live moments, competitive boards, exclusive rewards, and the people who make every stream count.</p>
            <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap">
              <Link to="/login" className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-sm font-semibold btn-accent sm:w-auto">Sign in with Kick <ArrowRight className="w-4 h-4" /></Link>
              <a href="https://kick.com/MisterTee" target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-sm font-semibold btn-accent-outline sm:w-auto"><Play className="w-4 h-4" /> Watch on Kick</a>
            </div>
            <div className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-[#252B38] pt-5">
              <div><p className="font-display text-2xl font-bold text-[#F5F7FA]">24/7</p><p className="mt-1 text-xs uppercase tracking-widest text-[#5F6878]">Energy</p></div>
              <div><p className="font-display text-2xl font-bold text-[#F5F7FA]">2</p><p className="mt-1 text-xs uppercase tracking-widest text-[#5F6878]">Game modes</p></div>
            </div>
          </div>
          <div className="relative rounded-2xl border border-[#252B38] bg-[#121620]/80 p-2 shadow-[0_24px_80px_rgba(0,0,0,.45)]">
            <div className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-[#8B5CF6]/10 blur-3xl" />
            <iframe src="https://player.kick.com/mistertee" frameBorder="0" allowFullScreen title="MisterTee Live Stream" className="w-full h-full aspect-video rounded-xl" />
            <div className="flex items-center justify-between px-3 py-3"><span className="text-xs uppercase tracking-[0.2em] text-[#5F6878]">Live broadcast</span><span className="flex items-center gap-2 text-xs font-semibold text-[#A78BFA]"><span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" /> MisterTee</span></div>
          </div>
        </section>
        <section className="px-4 py-10 sm:px-6 sm:py-16 mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:mb-8"><div><p className="section-kicker">Inside the club</p><h2 className="mt-2 text-2xl font-bold font-display sm:text-3xl lg:text-4xl">Built for the regulars.</h2></div><Link to="/rewards" className="hidden items-center gap-2 text-sm text-[#A78BFA] hover:text-white sm:flex">Explore rewards <ArrowRight className="w-4 h-4" /></Link></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {destinations.map(({ icon: Icon, label, title, copy, to }) => <Link key={to} to={to} className="group surface-panel flex min-h-40 flex-col justify-between p-6 transition duration-300 hover:-translate-y-1 hover:border-[#8B5CF6]/60"><div className="flex items-start justify-between"><Icon className="h-5 w-5 text-[#A78BFA]" /><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5F6878]">{label}</span></div><div><h3 className="font-display text-xl font-bold text-[#F5F7FA] group-hover:text-[#A78BFA]">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-[#8B93A3]">{copy}</p></div></Link>)}
          </div>
        </section>
        <section className="px-4 pt-6 pb-20 sm:px-6 mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 p-6 surface-panel sm:flex-row sm:items-center sm:p-8"><div className="flex gap-4"><CalendarDays className="mt-1 h-5 w-5 text-[#22D3EE]" /><div><p className="section-kicker">Every day on Kick</p><h2 className="mt-2 text-2xl font-bold font-display">The next session starts here.</h2><p className="mt-2 text-sm text-[#8B93A3]">Pull up at 7:30pm EST for live games, slot calls and community drops.</p></div></div><a href="https://kick.com/MisterTee" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm rounded-lg btn-accent shrink-0">Enter stream <ArrowRight className="w-4 h-4" /></a></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
