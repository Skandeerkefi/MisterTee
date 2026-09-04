import { useEffect, useState } from "react";
import { ArrowUpRight, MessageCircle, Radio, ShoppingBag, Trophy, Twitter, Youtube } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getApiBaseUrl } from "@/lib/apiBase";
import GraphicalBackground from "@/components/GraphicalBackground";

interface SocialLink { _id?: string; name: string; url: string; icon?: string; description?: string; }
const defaultLinks: SocialLink[] = [
  { name: "Kick", url: "https://kick.com/MisterTee", description: "Live streams, games and community sessions." },
  { name: "X", url: "https://x.com/Mister7ee", description: "Updates, clips and the latest drops." },
  { name: "Discord", url: "https://discord.com/invite/uUtsNgqbgS", description: "The community chat, giveaways and events." },
  
];
const icons = { Kick: Radio, X: Twitter, Discord: MessageCircle, Roobet: ShoppingBag, CSGOWIN: Trophy, Juice: Trophy };

function SocialShirt({ link, index }: { link: SocialLink; index: number }) {
  const Icon = icons[link.name as keyof typeof icons] || MessageCircle;
  const accent = index % 2 === 0 ? "#A78BFA" : "#22D3EE";
  return <a href={link.url} target="_blank" rel="noreferrer" className="group relative flex min-h-[290px] flex-col items-center justify-between overflow-hidden rounded-2xl border border-[#252B38] bg-[#121620] p-5 transition duration-300 hover:-translate-y-2 hover:border-[#8B5CF6]/70 hover:shadow-[0_20px_50px_rgba(0,0,0,.45)]"><div className="absolute transition-opacity rounded-full inset-x-8 top-8 h-28 opacity-10 blur-3xl group-hover:opacity-30" style={{ background: accent }} /><svg viewBox="0 0 180 210" className="relative h-40 w-36 drop-shadow-[0_18px_18px_rgba(0,0,0,.5)]" fill="none"><path d="M90 12V4M90 23v18M24 38h132" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" /><path d="M40 55 24 91h24v76q0 6 6 6h72q6 0 6-6V91h24L140 55l-34-8q-5-15-16-15T74 47z" fill="#181D27" stroke={accent} strokeWidth="2" /><path d="M74 47q5-15 16-15t16 15" fill="#181D27" stroke={accent} strokeWidth="2" /><path d="M78 48q5-9 12-9t12 9" fill="#0D1017" /><foreignObject x="52" y="72" width="76" height="62"><div className="flex flex-col items-center justify-center h-full" style={{ color: accent }}><Icon size={26} strokeWidth={1.5} /><span className="mt-2 text-[9px] font-bold tracking-[.18em]">{link.name.slice(0, 9).toUpperCase()}</span></div></foreignObject></svg><div className="relative text-center"><h2 className="font-display text-lg font-bold text-[#F5F7FA] group-hover:text-[#A78BFA]">{link.name}</h2><p className="mt-1 text-xs leading-5 text-[#8B93A3]">{link.description}</p><span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#A78BFA]">Open <ArrowUpRight className="w-3 h-3" /></span></div></a>;
}

export default function SocialsPage() {
  const [links, setLinks] = useState<SocialLink[]>(defaultLinks);
  useEffect(() => { fetch(`${getApiBaseUrl()}/api/socials`).then((response) => response.json()).then((data) => { if (Array.isArray(data) && data.length) setLinks(data); }).catch(() => undefined); }, []);
  return <div className="relative flex flex-col min-h-screen text-white"><GraphicalBackground /><Navbar /><main className="relative z-10 flex-1 w-full max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:py-12"><p className="text-center section-kicker">Find the community</p><h1 className="mt-2 text-3xl font-bold text-center font-display sm:text-4xl">Choose your channel</h1><p className="mx-auto mb-10 mt-3 max-w-xl text-center text-[#8B93A3]">Every shirt opens a different part of the MisterTee world.</p><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{links.map((link, index) => <SocialShirt key={link._id || link.name} link={link} index={index} />)}</div></main><Footer /></div>;
}


