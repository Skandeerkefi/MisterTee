import { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getApiBaseUrl } from "@/lib/apiBase";
import GraphicalBackground from "@/components/GraphicalBackground";

interface AffiliateLink {
  _id?: string;
  name: string;
  description: string;
  url: string;
  imageUrl: string;
  category?: string;
  signupUrl?: string;
  logoUrl?: string;
  rewards?: { icon: string; label: string }[];
}

const defaultRewards: AffiliateLink[] = [
  {
    name: "",
    url: "https://roobet.com/?code=MisterTee",
    imageUrl: "https://i.ibb.co/S7Mht4qH/r-NQNxh0.png",
    description: "Play on Roobet with code MisterTee.",
    rewards: [
      { icon: "🏅", label: "Monthly Leaderboard" },
      { icon: "💵", label: "Weekly Deposit bonus" },
      { icon: "🎁", label: "Monthly wager promotion" },
      { icon: "🎰", label: "Weekly free spins giveaway" },
    ],
  },
  {
    name: "",
    url: "https://csgowin.com/r/mistertee",
    imageUrl: "https://i.ibb.co/2YjY0XSt/Screenshot-2025-12-07-224214-removebg-preview.png",
    description: "Join CSGOWIN with MisterTee — battles & cases.",
    rewards: [
      { icon: "🏅", label: "Monthly Leaderboard" },
      { icon: "💵", label: "Weekly Deposit bonus" },
      { icon: "🎁", label: "Monthly wager promotion" },
      { icon: "🔪", label: "Weekly free battle giveaway" },
    ],
  },
  {
    name: "",
    url: "http://juice.gg/r/MisterTee",
    imageUrl: "https://juice.gg/_nuxt/juice-logo-white.BZVtVaam.png",
    description: "Play on Juice — code MisterTee affiliate.",
    rewards: [
      { icon: "🏅", label: "Monthly Leaderboard" },
      { icon: "💵", label: "Weekly Deposit bonus" },
      { icon: "🎁", label: "Monthly wager promotion" },
      { icon: "🔪", label: "Weekly free battle giveaway" },
    ],
  },
];

function RewardShirt({ link, index }: { link: AffiliateLink; index: number }) {
  const accent = index % 2 === 0 ? "#A78BFA" : "#22D3EE";
  const href = link.url || link.signupUrl || "#";
  const img = link.imageUrl || link.logoUrl || "";
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group relative flex min-h-[290px] flex-col items-center justify-between overflow-hidden rounded-2xl border border-[#252B38] bg-[#121620] p-5 transition duration-300 hover:-translate-y-2 hover:border-[#8B5CF6]/70 hover:shadow-[0_20px_50px_rgba(0,0,0,.45)]"
    >
      <div className="absolute transition-opacity rounded-full inset-x-8 top-8 h-28 opacity-10 blur-3xl group-hover:opacity-30" style={{ background: accent }} />
      <svg viewBox="0 0 180 210" className="relative h-40 w-36 drop-shadow-[0_18px_18px_rgba(0,0,0,.5)]" fill="none">
        <path d="M90 12V4M90 23v18M24 38h132" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" />
        <path d="M40 55 24 91h24v76q0 6 6 6h72q6 0 6-6V91h24L140 55l-34-8q-5-15-16-15T74 47z" fill="#181D27" stroke={accent} strokeWidth="2" />
        <path d="M74 47q5-15 16-15t16 15" fill="#181D27" stroke={accent} strokeWidth="2" />
        <path d="M78 48q5-9 12-9t12 9" fill="#0D1017" />
        <foreignObject x="52" y="72" width="76" height="62">
          <div className="flex flex-col items-center justify-center h-full px-2" style={{ color: accent }}>
            {img ? (
              <img
                src={img}
                alt={link.name}
                className="max-h-10 max-w-[72px] object-contain drop-shadow"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            ) : (
              <span className="text-2xl">🎁</span>
            )}
            <span className="mt-2 text-[9px] font-bold tracking-[.18em] text-center leading-tight">
              {link.name.slice(0, 12).toUpperCase()}
            </span>
          </div>
        </foreignObject>
      </svg>
      <div className="relative text-center">
        <h2 className="font-display text-lg font-bold text-[#F5F7FA] group-hover:text-[#A78BFA]">{link.name}</h2>
        <p className="mt-1 text-xs leading-5 text-[#8B93A3] line-clamp-2">{link.description}</p>
        {link.rewards && link.rewards.length > 0 && (
          <div className="mt-3 w-full rounded-xl border border-[#252B38] bg-[#0D1017] p-3">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-[#5F6878]">Rewards</p>
            <div className="flex flex-col gap-1.5">
              {link.rewards.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#8B93A3]">
                  <span className="text-sm">{r.icon}</span>
                  <span>{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#A78BFA]">
          Open <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </a>
  );
}

export default function RewardsPage() {
  const [links, setLinks] = useState<AffiliateLink[]>(defaultRewards);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/rewards`);
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        // normalize backend shape (signupUrl/logoUrl) to url/imageUrl
        const mapped: AffiliateLink[] = data.map((a: any) => ({
          _id: a._id,
          name: a.name,
          description: a.description || "",
          url: a.url || a.signupUrl || "",
          imageUrl: a.imageUrl || a.logoUrl || "",
          category: a.category || "",
          rewards: a.rewards || [],
        }));
        // if backend already has our 3, use them; otherwise merge/fallback
        const hasAll = ["roobet", "csgowin", "juice"].every((k) => mapped.some((m) => m.name.toLowerCase().includes(k)));
        if (hasAll) setLinks(mapped);
        else setLinks(mapped.length ? mapped : defaultRewards);
      }
    } catch {
      // keep defaultRewards
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen text-white">
      <GraphicalBackground />
      <Navbar />
      <main className="relative z-10 flex-1 w-full max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:py-12">
        <p className="text-center section-kicker">Our partners</p>
        <h1 className="mt-2 text-3xl font-bold text-center sm:text-4xl font-display">Rewards & Partnerships</h1>
        <p className="mx-auto mb-10 mt-3 max-w-xl text-center text-[#8B93A3]">Every shirt opens a partner — code MisterTee active.</p>
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link, index) => (
              <RewardShirt key={link._id || link.name} link={link} index={index} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
