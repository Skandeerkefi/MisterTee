import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getApiBaseUrl } from "@/lib/apiBase";
import { useAuthStore } from "@/store/useAuthStore";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Trophy, Medal, Crown, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface Entry { rank: number; kickUsername: string; pointsBalance: number; lifetimePointsEarned: number; }

export default function PointsLeaderboardPage(){
  const { user } = useAuthStore();
  const [lb,setLb]=useState<Entry[]>([]);
  const [loading,setLoading]=useState(true);
  const [page,setPage]=useState(1);
  const [type,setType]=useState<"balance"|"lifetime">("balance");
  useEffect(()=>{ fetchLb(); },[page,type]);
  const fetchLb=async()=>{
    setLoading(true);
    try{
      const r=await fetch(`${getApiBaseUrl()}/api/points-leaderboard?page=${page}&limit=20&type=${type}`);
      const d=await r.json();
      setLb(Array.isArray(d.leaderboard)?d.leaderboard:[]);
    }catch{}
    setLoading(false);
  };
  const top3=lb.slice(0,3);
  const rest=lb.slice(3);
  const isYou=(n:string)=> Boolean(user?.kickUsername && n.toLowerCase()===user.kickUsername.toLowerCase());
  const hasPodium = page===1 && top3.length>0;
  const podiumSlots = (()=>{
    const s:Array<{rank:number; data?:Entry; cls:string; accent:string; bg:string; order:string; mt:string; label:string; Icon:any}> = [
      { rank:2, data:top3[1], cls:"border-[#8B93A3]/20", accent:"text-[#8B93A3]", bg:"bg-[#8B93A3]/10 border-[#8B93A3]/20", order:"order-2 sm:order-1", mt:"sm:mt-8", label:"#2", Icon:Medal },
      { rank:1, data:top3[0], cls:"border-yellow-500/25 shadow-[0_0_40px_rgba(234,179,8,.18)]", accent:"text-yellow-400", bg:"bg-yellow-500/10 border-yellow-500/20", order:"order-1 sm:order-2", mt:"", label:"#1", Icon:Trophy },
      { rank:3, data:top3[2], cls:"border-amber-700/30", accent:"text-amber-500", bg:"bg-amber-600/10 border-amber-700/20", order:"order-3 sm:order-3", mt:"sm:mt-12", label:"#3", Icon:Medal },
    ];
    return s.filter(x=> !!x.data);
  })();
  const listEntries = page===1 ? rest : lb;
  const showEmptyList = !loading && listEntries.length===0 && lb.length>0 && page===1 && top3.length>0;
  return(
    <div className="relative flex flex-col min-h-screen text-white">
      <GraphicalBackground/><Navbar/>
      <main className="relative z-10 flex-1 w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 mx-auto">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker flex items-center gap-2"><Sparkles className="h-3 w-3"/> Hall of fame</p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">Points <span className="text-gradient-accent">Leaderboard</span></h1>
            <p className="mt-3 max-w-xl text-sm sm:text-base leading-6 text-[#8B93A3]">Top vault holders — live rankings by current balance or all-time earned. Updated on every points movement.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(["balance","lifetime"] as const).map(t=> (
                <button key={t} onClick={()=>{setType(t);setPage(1)}} className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition ${type===t?"bg-[#8B5CF6] text-white shadow-glow-sm":"border border-[#252B38] bg-[#121620] text-[#8B93A3] hover:border-[#8B5CF6]/40 hover:text-[#A78BFA]"}`}>{t==="balance"?"Current Balance":"Lifetime Earned"}</button>
              ))}
            </div>
          </div>
          <div className="w-full lg:w-[360px] shrink-0 surface-panel p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/20"><Crown className="h-5 w-5 text-[#A78BFA]"/></div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5F6878]">Your standing</p>
                <p className="font-display text-base font-bold truncate">{user?user.kickUsername:"Sign in to rank"}</p>
              </div>
            </div>
            {user && (
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-[#252B38] bg-[#0D1017] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#5F6878]">Balance</p>
                  <p className="mt-1 font-bold text-[#A78BFA] text-sm">{(user.pointsBalance??0).toLocaleString()} pts</p>
                </div>
                <div className="rounded-xl border border-[#252B38] bg-[#0D1017] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#5F6878]">Lifetime</p>
                  <p className="mt-1 font-bold text-white text-sm">{((user as any).lifetimePointsEarned??0).toLocaleString()} pts</p>
                </div>
              </div>
            )}
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-[#5F6878]">Page {page} — Top 20 per page</span>
              <a href="/shop" className="inline-flex items-center gap-1 font-semibold text-[#A78BFA] hover:text-white">Shop <ArrowRight className="h-3 w-3"/></a>
            </div>
          </div>
        </div>
        {/* podium — premium responsive layout: stacked on mobile, tiered on desktop */}
        {hasPodium && (
          <div className={`mt-12 grid gap-4 sm:gap-5 lg:gap-6 items-end ${podiumSlots.length===1 ? "grid-cols-1 max-w-sm mx-auto" : podiumSlots.length===2 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 sm:grid-cols-3"}`}>
            {podiumSlots.map(s=>{
              const e=s.data!;
              const vals= type==="balance"? e.pointsBalance : e.lifetimePointsEarned;
              const Icon=s.Icon;
              const you=isYou(e.kickUsername||"");
              const isGold = s.rank===1;
              return(
                <div key={s.rank} className={`relative flex flex-col items-center rounded-2xl border bg-[#121620] px-4 pb-6 pt-10 sm:px-5 text-center transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,.35)] ${s.cls} ${s.order} ${s.mt} ${isGold?"sm:pb-8 sm:pt-11 ring-1 ring-yellow-500/10":""}`}>
                  <div className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-[#08090D] px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest shadow-lg ${s.cls} ${s.rank===1?"text-yellow-300 border-yellow-500/30":s.rank===2?"text-[#8B93A3]":"text-amber-400"}`}>{s.label}</div>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${s.bg}`}><Icon className={`h-7 w-7 ${s.accent}`}/></div>
                  <p className={`mt-4 w-full max-w-[18ch] truncate text-center text-sm font-bold ${you?"text-[#A78BFA]":"text-[#F5F7FA]"}`} title={e.kickUsername||"???"}>{e.kickUsername||"???"}</p>
                  {you && <span className="mt-1.5 rounded-full bg-[#8B5CF6] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">You</span>}
                  <p className={`mt-2 font-display text-2xl font-bold ${s.accent}`}>{vals.toLocaleString()}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#5F6878]">points</p>
                </div>
              );
            })}
          </div>
        )}

        {/* rankings */}
        <div className="mt-8 surface-panel overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-[#252B38] px-4 py-3 sm:px-6">
            <h2 className="font-display text-sm font-bold tracking-wide text-[#F5F7FA]">Rankings</h2>
            <span className="text-xs text-[#5F6878]">{loading?"Loading...": hasPodium ? `${listEntries.length} more — ${lb.length} total` : `${lb.length} shown`}</span>
          </div>
          {loading ? (
            <div className="divide-y divide-[#252B38]">{Array.from({length:8}).map((_,i)=><div key={i} className="flex items-center gap-3 p-4 animate-pulse"><div className="h-8 w-8 rounded-lg bg-[#252B38]"/><div className="h-4 w-32 rounded bg-[#252B38]"/><div className="ml-auto h-4 w-20 rounded bg-[#252B38]"/></div>)}</div>
          ) : listEntries.length>0 ? (
            <div className="divide-y divide-[#252B38]/60">
              {listEntries.map(e=>{
                const v=type==="balance"? e.pointsBalance : e.lifetimePointsEarned;
                const you=isYou(e.kickUsername||"");
                return(
                  <div key={e.rank} className={`flex items-center gap-3 px-4 py-3 sm:px-6 transition ${you?"bg-[#8B5CF6]/10 border-l-2 border-l-[#8B5CF6]":"hover:bg-[#8B5CF6]/5"}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${you?"border-[#8B5CF6]/30 bg-[#8B5CF6]/15 text-[#A78BFA]": e.rank<=10?"border-[#252B38] bg-[#0D1017] text-[#8B93A3]":"border-transparent bg-[#0D1017] text-[#5F6878]"}`}>#{e.rank}</span>
                    <div className="min-w-0 flex-1"><p className={`truncate text-sm font-semibold ${you?"text-[#A78BFA]":"text-[#F5F7FA]"}`}>{e.kickUsername||"???"} {you && <span className="ml-2 rounded-full bg-[#8B5CF6] px-1.5 py-0.5 text-[10px] text-white">YOU</span>}</p></div>
                    <span className="shrink-0 font-display text-sm font-bold text-[#A78BFA]">{v.toLocaleString()} <span className="text-xs font-normal text-[#5F6878]">pts</span></span>
                  </div>
                )
              })}
            </div>
          ) : showEmptyList ? (
            <div className="py-10 text-center text-sm text-[#8B93A3]">All ranked holders are shown on the podium above.</div>
          ) : (
            <div className="py-16 text-center text-sm text-[#8B93A3]">No leaderboard data yet. Be the first to earn points.</div>
          )}
          <div className="flex items-center justify-between border-t border-[#252B38] bg-[#0D1017]/50 px-4 py-3">
            <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="inline-flex items-center gap-1 rounded-full border border-[#252B38] bg-[#121620] px-3 py-2 text-xs font-bold uppercase tracking-widest text-[#8B93A3] disabled:opacity-40 hover:border-[#8B5CF6]/40 hover:text-white"><ChevronLeft className="h-3.5 w-3.5"/> Prev</button>
            <span className="text-xs font-semibold tracking-widest text-[#8B93A3]">PAGE <span className="text-[#F5F7FA]">{page}</span></span>
            <button disabled={lb.length<20} onClick={()=>setPage(p=>p+1)} className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#A78BFA] disabled:opacity-40">Next <ChevronRight className="h-3.5 w-3.5"/></button>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-[#5F6878]">Rankings reflect audited points ledger. Ties broken by earliest earned.</p>
      </main><Footer/></div>
  )
}
