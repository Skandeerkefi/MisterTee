import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { usePointsStore } from "@/store/usePointsStore";
import { getApiBaseUrl } from "@/lib/apiBase";
import { Bomb, Gem, Coins, ShieldCheck, Trophy, History, Info, RotateCcw, Zap, AlertTriangle, Eye } from "lucide-react";

type Game = { gameId:string; wager:number; gridSize:number; totalTiles:number; mines:number; revealed:number[]; multiplier:number; potentialWin:number; next:number|null; hash?:string; clientSeed?:string; nonce?:string; status:"active"|"won"|"lost"; minePos?:number[] };
const PRE5=[1,2,3,5,10,15,20,24] as const;
const calc=(t:number,m:number,s:number)=>{ if(!s) return 1; const safe=t-m; if(s>safe) return 0; let p=1; for(let i=0;i<s;i++) p*=(safe-i)/(t-i); return p<=0?0:Number(((1/p)*0.85).toFixed(2)); };

export default function MinesPage(){
  const {user}=useAuthStore(); const {profile,fetchProfile}=usePointsStore();
  const [bet,setBet]=useState(100); const [mines,setMines]=useState(5);
  const grid=5 as const; const total=25; const maxM=24;
  const [seed,setSeed]=useState(""); const [g,setG]=useState<Game|null>(null);
  const [hit,setHit]=useState<number|null>(null); const [revealing,setRevealing]=useState<number|null>(null);
  const [loading,setLoading]=useState(false); const [err,setErr]=useState<string|null>(null);
  const [cfg,setCfg]=useState<any>(null); const [fair,setFair]=useState<any>(null); const [hist,setHist]=useState<any[]>([]); const [showFair,setShowFair]=useState(false);
  const presets=useMemo(()=>[...PRE5] as number[],[]);
  const bal=profile?.balance ?? user?.pointsBalance ?? 0;
  const loadCfg=async()=>{ const t=localStorage.getItem("token"); if(!t) return; try{ const r=await fetch(`${getApiBaseUrl()}/api/games/config/mines`,{headers:{Authorization:`Bearer ${t}`}}); if(r.ok) setCfg(await r.json());}catch{}};
  const loadHist=async()=>{ const t=localStorage.getItem("token"); if(!t) return; try{ const r=await fetch(`${getApiBaseUrl()}/api/games/history?gameType=mines&limit=12`,{headers:{Authorization:`Bearer ${t}`}}); if(r.ok){ const d=await r.json(); setHist(d.games||[]);} }catch{}};
  const loadActive=async()=>{ const t=localStorage.getItem("token"); if(!t) return; try{ const r=await fetch(`${getApiBaseUrl()}/api/games/mines/active`,{headers:{Authorization:`Bearer ${t}`}}); if(r.ok){ const d=await r.json(); if(d.active) setG({gameId:d.gameId,wager:d.wager,gridSize:5,totalTiles:25,mines:d.mines,revealed:d.revealedCells||[],multiplier:d.multiplier||1,potentialWin:d.potentialWin||0,next:d.nextMultiplier,status:"active",hash:d.serverSeedHash,clientSeed:d.clientSeed,nonce:d.nonce}); } }catch{}};
  useEffect(()=>{ loadCfg(); fetchProfile(); loadHist(); },[]);
  const start=async()=>{
    const t=localStorage.getItem("token");
    if(!t){ setErr("Please log in"); return; }
    if(bet<(cfg?.minWager??1)){ setErr(`Min bet ${cfg?.minWager}`); return; }
    if(bet>(cfg?.maxWager??100000)){ setErr(`Max bet ${cfg?.maxWager}`); return; }
    setLoading(true); setErr(null);
    try{
      const r=await fetch(`${getApiBaseUrl()}/api/games/mines/create`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({bet,gridSize:5,mines,clientSeed:seed||undefined})});
      const d=await r.json(); if(!r.ok) throw new Error(d.error||"Failed");
      setG({gameId:d.gameId,wager:d.wager??bet,gridSize:5,totalTiles:25,mines:d.mines??mines,revealed:[],multiplier:d.multiplier??1,potentialWin:0,next:d.nextMultiplier??calc(25,d.mines??mines,1),status:"active",hash:d.serverSeedHash,clientSeed:d.clientSeed,nonce:d.nonce});
      setHit(null); setFair(null); await fetchProfile(); await loadHist();
    }catch(e:any){
      const msg = e.message || "Failed";
      if (msg.includes("already have an active")) {
        // auto-resume the dangling game so the board isn't stuck
        try { await loadActive(); } catch {}
        setErr(msg + " — resumed your active board. Cash Out or Forfeit to start a new one.");
      } else setErr(msg);
    } finally{ setLoading(false);}
  };
  const reveal=async(idx:number)=>{
    if(!g||g.status!=="active"||g.revealed.includes(idx)||hit!==null) return;
    const t=localStorage.getItem("token"); if(!t) return;
    setRevealing(idx); setErr(null);
    try{
      const r=await fetch(`${getApiBaseUrl()}/api/games/mines/reveal`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({gameId:g.gameId,tile:idx})});
      const d=await r.json(); if(!r.ok) throw new Error(d.error||"Reveal failed");
      if(d.result==="mine"){ setHit(d.tile); setG(p=>p?{...p,revealed:d.revealedCells||p.revealed,minePos:d.minePositions,status:"lost",multiplier:0,potentialWin:0}:p); await fetchProfile(); await loadHist(); }
      else if(d.autoWin){ setG(p=>p?{...p,revealed:d.revealedCells,minePos:d.minePositions,multiplier:d.multiplier,potentialWin:d.payout,status:"won",next:null}:p); await fetchProfile(); await loadHist(); }
      else setG(p=>p?{...p,revealed:d.revealedCells,multiplier:d.multiplier,potentialWin:d.potentialWin,next:d.nextMultiplier,status:"active"}:p);
    }catch(e:any){ setErr(e.message);} finally{ setRevealing(null);}
  };
  const cashOut=async()=>{
    if(!g||g.status!=="active"||!g.revealed.length) return;
    const t=localStorage.getItem("token"); if(!t) return;
    setLoading(true); setErr(null);
    try{
      const r=await fetch(`${getApiBaseUrl()}/api/games/mines/cashout`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({gameId:g.gameId})});
      const d=await r.json(); if(!r.ok) throw new Error(d.error||"Cash out failed");
      setG(p=>p?{...p,minePos:d.minePositions,multiplier:d.multiplier,potentialWin:d.payout,status:"won"}:p);
      await fetchProfile(); await loadHist();
    }catch(e:any){ setErr(e.message);} finally{ setLoading(false);}
  };
  const abandon=async()=>{
    const t=localStorage.getItem("token"); if(!t) return;
    setLoading(true); setErr(null);
    try{
      const r=await fetch(`${getApiBaseUrl()}/api/games/mines/abandon`,{method:"POST",headers:{Authorization:`Bearer ${t}`}});
      const d=await r.json(); if(!r.ok) throw new Error(d.error||"Abandon failed");
      setG(p=>p?{...p,minePos:d.minePositions||p.minePos,status:"lost"}:p);
      setHit(null); await fetchProfile(); await loadHist();
      // after forfeit, allow fresh START — show busted state briefly
      setTimeout(()=>reset(), 1800);
    }catch(e:any){ setErr(e.message);} finally{ setLoading(false);}
  };
  const fetchFairness=async()=>{
    if(!g) return; const t=localStorage.getItem("token"); if(!t) return;
    try{ const r=await fetch(`${getApiBaseUrl()}/api/games/mines/fairness/${g.gameId}`,{headers:{Authorization:`Bearer ${t}`}}); if(r.ok){ setFair(await r.json()); setShowFair(true);} }catch{}
  };
  const reset=()=>{ setG(null); setHit(null); setFair(null); setShowFair(false); setErr(null); };
  const isPlaying=g?.status==="active"; const canCash=isPlaying&&(g?.revealed.length??0)>0;
  const safe=g?.revealed.length??0; const curMult=g?.multiplier??1; const pot=g?.potentialWin??0;
  const nextPreview=useMemo(()=>{
    if(!g||g.status!=="active") return null;
    if(g.next) return g.next;
    const n=safe+1; if(n>g.totalTiles-g.mines) return null;
    return calc(g.totalTiles,g.mines,n);
  },[g,safe]);
  const qb=[50,100,500,1000,5000];
  return (
    <div className="min-h-screen bg-[#08090D] relative">
      <GraphicalBackground/><Navbar/>
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="w-full lg:w-[340px] shrink-0 space-y-4">
            <div className="rounded-2xl border border-[#252B38] bg-[#121620]/90 backdrop-blur-xl overflow-hidden shadow-card-dark">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-white">MINES</h2>
                <span className={`text-[10px] font-bold tracking-widest px-2 py-1 rounded-full border ${isPlaying?"bg-emerald-500/10 text-emerald-400 border-emerald-500/30":g?.status==="won"?"bg-violet-500/15 text-violet-300 border-violet-500/30":g?.status==="lost"?"bg-red-500/10 text-red-400 border-red-500/30":"bg-[#252B38] text-[#5F6878] border-[#252B38]"}`}>{isPlaying?"● ACTIVE":g?.status==="won"?"CASHED OUT":g?.status==="lost"?"BUSTED":"IDLE"}</span>
              </div>
              <div className="px-5 space-y-3">
                <label className="text-[10px] font-bold tracking-[0.18em] text-[#5F6878] flex items-center gap-1.5"><Coins className="w-3 h-3"/> BET AMOUNT</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5F6878] text-sm">$</span><input type="number" value={bet} onChange={e=>setBet(Math.max(1,Number(e.target.value)||1))} disabled={!!isPlaying} className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-[#08090D] border border-[#252B38] text-white text-sm font-semibold focus:outline-none focus:border-[#8B5CF6] disabled:opacity-60"/></div>
                  <button onClick={()=>setBet(b=>Math.max(1,Math.floor(b/2)))} disabled={!!isPlaying} className="px-3 py-2.5 rounded-xl bg-[#252B38] text-white text-xs font-bold disabled:opacity-50">1/2</button>
                  <button onClick={()=>setBet(b=>Math.min(cfg?.maxWager??100000,b*2))} disabled={!!isPlaying} className="px-3 py-2.5 rounded-xl bg-[#252B38] text-white text-xs font-bold disabled:opacity-50">2x</button>
                </div>
                <div className="flex flex-wrap gap-1.5">{qb.map(v=><button key={v} onClick={()=>!isPlaying&&setBet(v)} disabled={!!isPlaying} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${bet===v?"bg-[#8B5CF6] text-white border-[#8B5CF6]":"bg-[#181D27] text-[#8B93A3] border-[#252B38]"}`}>{v}</button>)}</div>
                {cfg&&<p className="text-[11px] text-[#5F6878]">Limits {cfg.minWager}-{cfg.maxWager} · Bal <span className="text-white font-semibold">{bal.toLocaleString()}</span></p>}
              </div>



              <div className="px-5 pt-4 space-y-2">
                <label className="text-[10px] font-bold tracking-[0.18em] text-[#5F6878]">GRID SIZE — 5×5 ONLY</label>
                <div className="w-full py-2.5 rounded-xl bg-[#08090D] border border-[#252B38] text-white text-sm font-bold text-center">5 × 5 <span className="text-[#5F6878] font-normal">· 25 tiles · Fixed</span></div>
                <p className="text-[11px] text-[#5F6878]">Only 5×5 is supported.</p>
              </div>
              <div className="px-5 pt-4 space-y-2">
                <label className="text-[10px] font-bold tracking-[0.18em] text-[#5F6878] flex items-center gap-1.5"><Bomb className="w-3 h-3"/> MINES</label>
                <div className="flex items-center gap-2">
                  <button onClick={()=>!isPlaying&&setMines(m=>Math.max(1,m-1))} disabled={!!isPlaying} className="w-9 h-9 rounded-xl bg-[#181D27] border border-[#252B38] text-white font-bold disabled:opacity-40">-</button>
                  <div className="flex-1 text-center py-2 rounded-xl bg-[#08090D] border border-[#252B38] text-white font-bold text-sm">{mines}</div>
                  <button onClick={()=>!isPlaying&&setMines(m=>Math.min(maxM,m+1))} disabled={!!isPlaying} className="w-9 h-9 rounded-xl bg-[#181D27] border border-[#252B38] text-white font-bold disabled:opacity-40">+</button>
                </div>
                <div className="flex flex-wrap gap-1.5">{presets.filter(v=>v<=maxM).map(v=><button key={v} onClick={()=>!isPlaying&&setMines(v)} disabled={!!isPlaying} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${mines===v?"bg-[#EF4444] text-white border-[#EF4444]":"bg-[#181D27] text-[#8B93A3] border-[#252B38]"}`}>{v}</button>)}</div>
                <p className="text-[11px] text-[#5F6878]">{25-mines} safe · Next <span className="text-[#A78BFA] font-semibold">{isPlaying?nextPreview?`${nextPreview.toFixed(2)}x`:"-":`${calc(25,mines,1).toFixed(2)}x`}</span></p>
              </div>
              <div className="px-5 pt-3">
                <label className="text-[10px] font-bold tracking-[0.18em] text-[#5F6878] flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> CLIENT SEED</label>
                <input value={seed} onChange={e=>setSeed(e.target.value)} disabled={!!isPlaying} placeholder="Leave empty for random" className="mt-1 w-full px-3 py-2 rounded-xl bg-[#08090D] border border-[#252B38] text-white text-xs placeholder:text-[#5F6878] focus:outline-none focus:border-[#8B5CF6] disabled:opacity-60"/>
                {g?.hash&&<p className="mt-2 text-[10px] font-mono text-[#5F6878] break-all">Hash {g.hash.slice(0,24)}...</p>}
              </div>
              <div className="p-5 space-y-3">
                {!isPlaying ? <Button onClick={start} disabled={loading} className="w-full h-12 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold"><Zap className="w-4 h-4 mr-2"/>{loading?"STARTING...":"START GAME"}</Button>
                : <><Button onClick={cashOut} disabled={!canCash||loading} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-40">CASH OUT {pot>0?`· ${pot.toLocaleString()}`:""} {curMult>1?`(${curMult.toFixed(2)}x)`:""}</Button><button onClick={abandon} disabled={loading} className="w-full text-xs text-red-400 hover:text-red-300 py-1">Forfeit (abandon game)</button></>}
                {(g?.status==="won"||g?.status==="lost")&&<Button variant="outline" onClick={reset} className="w-full rounded-xl border-[#252B38] text-[#8B93A3]"><RotateCcw className="w-4 h-4 mr-2"/> NEW GAME</Button>}
                {g&&<button onClick={fetchFairness} className="w-full text-xs text-[#8B93A3] hover:text-[#A78BFA] flex items-center justify-center gap-1.5 py-2"><Eye className="w-3.5 h-3.5"/> Provably fair — verify</button>}
                {err&&<div className="flex gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-xs text-red-300 whitespace-pre-wrap"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"/>{err}{err.includes("active Mines game")&&<button onClick={abandon} className="ml-2 underline text-red-300 hover:text-white font-bold">Forfeit now</button>}</div>}
              </div>
              {isPlaying&&<div className="mx-5 mb-5 rounded-xl bg-[#08090D] border border-[#252B38] p-3 flex items-center justify-between"><span className="text-xs text-[#5F6878] font-semibold">Potential Win</span><span className="text-sm font-bold text-emerald-400">{pot.toLocaleString()} pts <span className="text-[#5F6878] font-normal">· {curMult.toFixed(2)}x</span></span></div>}
            </div>
            {hist.length>0&&<div className="rounded-2xl border border-[#252B38] bg-[#121620]/80 p-4"><h3 className="text-xs font-bold tracking-widest text-[#8B93A3] flex items-center gap-2 mb-3"><History className="w-4 h-4"/> MINES HISTORY</h3><div className="space-y-2 max-h-[280px] overflow-auto pr-1">{hist.slice(0,8).map((r:any)=><div key={r._id} className={`flex items-center justify-between rounded-xl px-3 py-2.5 border text-xs ${r.outcome==="win"?"bg-emerald-500/10 border-emerald-500/20 text-emerald-300":r.outcome==="loss"?"bg-red-500/10 border-red-500/20 text-red-300":"bg-[#181D27] border-[#252B38] text-[#8B93A3]"}`}><span>Bet {r.wager} · {r.meta?.bombCount??"?"} mines · {r.multiplier?Number(r.multiplier).toFixed(2)+"x":"-"}</span><span className="font-bold">{r.outcome==="win"?`+${r.payout}`:r.outcome==="loss"?"0":"..."}</span></div>)}</div></div>}
          </div>
          <div className="flex-1 min-w-0 space-y-4">
            <div className="rounded-2xl border border-[#252B38] bg-[#121620]/80 backdrop-blur p-3 sm:p-4">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-full bg-[#181D27] border border-[#252B38] text-[#8B93A3] font-semibold">Mines <b className="text-white">{g?g.mines:mines}</b></span>
                <span className="px-3 py-1.5 rounded-full bg-[#181D27] border border-[#252B38] text-[#8B93A3] font-semibold">Safe <b className="text-emerald-400">{safe}</b>/{g?g.totalTiles-g.mines:25-mines}</span>
                <span className="ml-auto px-3 py-1.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] font-bold">x{isPlaying||g?.status==="won"||g?.status==="lost"?curMult.toFixed(2):"1.00"}</span>
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">{pot.toLocaleString()} pts</span>
              </div>
              {isPlaying&&nextPreview&&<p className="mt-2 text-[11px] text-[#5F6878]">Next safe - <b className="text-[#A78BFA]">{nextPreview.toFixed(2)}x</b> - Cash out before a mine!</p>}
            </div>
            {g?.status==="won"&&<div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300">CASHED OUT - Won {g.potentialWin} pts - {curMult.toFixed(2)}x</div>}
            {g?.status==="lost"&&<div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">MINE HIT - Lost {g.wager} pts</div>}
            {!g&&<div className="rounded-2xl border border-[#252B38] bg-[#121620]/60 px-4 py-3 flex gap-2 text-sm text-[#8B93A3]"><Info className="w-4 h-4"/> Choose bet & mines - Start - Pick tiles - Cash Out before a mine!</div>}
            <div className="rounded-2xl border border-[#252B38] bg-[#0D1017] p-3 sm:p-5 lg:p-6 shadow-card-dark">
              <div className="grid gap-2 sm:gap-3 mx-auto" style={{gridTemplateColumns:`repeat(5,minmax(0,1fr))`,maxWidth:"460px"}}>

                {Array.from({length:25}).map((_,idx)=>{
                  const rev=g?.revealed.includes(idx);
                  const isHit=hit===idx;
                  const isMine=g?.minePos?.includes(idx);
                  const ended=g?.status==="won"||g?.status==="lost";
                  const showMine=ended&&isMine;
                  const clickable=isPlaying&&!rev&&hit===null&&revealing===null;
                  return <button key={idx} onClick={()=>reveal(idx)} disabled={!clickable} className={`aspect-square rounded-xl sm:rounded-2xl border-2 flex items-center justify-center text-xl sm:text-2xl font-bold transition-all ${isHit?"bg-red-500 border-red-400":rev?"bg-emerald-500/15 border-emerald-500/40 text-emerald-400":showMine&&!isHit?"bg-red-500/20 border-red-500/30 text-red-400":"bg-[#181D27] border-[#252B38] hover:border-[#8B5CF6]/60 text-[#5F6878]"} ${clickable?"cursor-pointer active:scale-[0.96]":"cursor-default"} ${revealing===idx?"opacity-60":""}`}>
                    {revealing===idx?<span className="w-5 h-5 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"/>:isHit?<Bomb className="w-6 h-6"/>:rev?<Gem className="w-6 h-6"/>:showMine?<Bomb className="w-5 h-5 opacity-80"/>:<span className="text-[#3A4150]">?</span>}
                  </button>;
                })}
              </div>
              {isPlaying&&<p className="mt-4 text-center text-xs text-[#5F6878]">SAFE = Gem - Cash Out or Hit Mine!</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#252B38] bg-[#121620]/70 p-4"><p className="text-[10px] font-bold tracking-widest text-[#5F6878]">HOW IT WORKS</p><p className="mt-2 text-xs text-[#8B93A3]">Bet - Pick tiles - Each safe raises multiplier - <b className="text-white">Cash Out</b> anytime.</p></div>
              <div className="rounded-xl border border-[#252B38] bg-[#121620]/70 p-4"><p className="text-[10px] font-bold tracking-widest text-[#5F6878] flex items-center gap-1"><Trophy className="w-3 h-3"/> HOUSE EDGE</p><p className="mt-2 text-xs text-[#8B93A3]">15% - <span className="text-white font-mono">1 / P(safe)</span> server-side.</p></div>
              <div className="rounded-xl border border-[#252B38] bg-[#121620]/70 p-4"><p className="text-[10px] font-bold tracking-widest text-[#5F6878] flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> PROVABLY FAIR</p><p className="mt-2 text-xs text-[#8B93A3]">Hash before play. <button onClick={fetchFairness} className="text-[#A78BFA] underline">Verify</button> after round.</p></div>
            </div>
            {showFair&&fair&&<div className="rounded-2xl border border-[#8B5CF6]/30 bg-[#121620] p-4 space-y-2"><h4 className="text-sm font-bold text-white flex gap-2"><ShieldCheck className="w-4 h-4 text-[#8B5CF6]"/> Provably Fair - {String(fair.gameId).slice(0,8)}...</h4><div className="grid gap-2 text-xs font-mono break-all"><div><span className="text-[#5F6878]">Hash:</span> <span className="text-[#A78BFA]">{fair.serverSeedHash}</span></div>{fair.serverSeed&&<div><span className="text-[#5F6878]">Seed:</span> <span className="text-white">{fair.serverSeed}</span></div>}<div><span className="text-[#5F6878]">Client:</span> <span className="text-white">{fair.clientSeed}</span></div><div><span className="text-[#5F6878]">Nonce:</span> <span className="text-white">{fair.nonce}</span></div><div><span className="text-[#5F6878]">Verified:</span> <span className={fair.verified?"text-emerald-400":"text-amber-400"}>{fair.verified?"Yes":"Pending"}</span>{fair.hashValid!==null&&<span className={fair.hashValid?"text-emerald-400":"text-red-400"}> - Hash {fair.hashValid?"valid":"INVALID"}</span>}</div></div><button onClick={()=>setShowFair(false)} className="text-xs text-[#8B93A3] hover:text-white">Close</button></div>}
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
}

