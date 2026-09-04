import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { getApiBaseUrl } from "@/lib/apiBase";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Coins, Search, Sparkles, Package, Award, ArrowRight, X } from "lucide-react";
interface ShopItem { _id: string; name: string; description: string; costInPoints: number; stock: number | null; stockRemaining: number | null; imageUrl: string; category: string; }
export default function PointsShopPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string|null>(null);
  const [message, setMessage] = useState<{type:"success"|"error";text:string}|null>(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  useEffect(()=>{fetchItems()},[]);
  const fetchItems = async ()=>{ setLoading(true); try{const r=await fetch(`${getApiBaseUrl()}/api/shop/items`);const d=await r.json();setItems(Array.isArray(d)?d:[])}catch{} setLoading(false);};
  const handleRedeem = async (id:string)=>{ const token=localStorage.getItem("token"); if(!token){setMessage({type:"error",text:"Please sign in with Kick."});return} setRedeeming(id); try{const r=await fetch(`${getApiBaseUrl()}/api/shop/redeem`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({itemId:id})});const d=await r.json();if(r.ok) setMessage({type:"success",text:`Redeemed — ${d.redemption?.shopItem||"item"} queued.`}); else setMessage({type:"error",text:d.error||"Redemption failed"})}catch{setMessage({type:"error",text:"Network error"})} setRedeeming(null);};
  const categories = useMemo(()=>["all",...Array.from(new Set(items.map(i=>i.category).filter(Boolean) as string[]))],[items]);
  const filtered = useMemo(()=>{ let l=filter==="all"?items:items.filter(i=>i.category===filter); if(query.trim()){const q=query.toLowerCase();l=l.filter(i=>i.name.toLowerCase().includes(q)||i.description.toLowerCase().includes(q))} return l;},[items,filter,query]);
  const balance=user?.pointsBalance??0;
  return (
    <div className="relative flex flex-col min-h-screen text-white">
      <GraphicalBackground /><Navbar />
      <main className="relative z-10 flex-1 w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 mx-auto">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker flex items-center gap-2"><Sparkles className="h-3 w-3"/> Vault rewards</p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#F5F7FA]">Points <span className="text-gradient-accent">Shop</span></h1>
            <p className="mt-3 text-sm sm:text-base leading-6 text-[#8B93A3] max-w-xl">Turn watch time into real rewards. Every redemption is audited and fulfilled by the team.</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#252B38] bg-[#121620] px-3 py-1.5 text-[#8B93A3]"><Package className="h-3.5 w-3.5 text-[#A78BFA]"/> {items.length} rewards live</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-3 py-1.5 text-[#A78BFA]"><Award className="h-3.5 w-3.5"/> Audited fulfilment</span>
            </div>
          </div>
          <div className="w-full lg:w-[340px] shrink-0 surface-panel p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/20"><Coins className="h-5 w-5 text-[#A78BFA]"/></div>
              <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5F6878]">Your vault balance</p><p className="font-display text-2xl font-bold text-[#F5F7FA]">{balance.toLocaleString()} <span className="text-sm font-semibold text-[#A78BFA]">pts</span></p></div>
            </div>
            <div className="mt-4 h-px bg-[#252B38]"/>
            <div className="mt-4 flex items-center justify-between text-xs"><span className="text-[#8B93A3]">Earn by watching & daily claim</span><a href="/profile" className="inline-flex items-center gap-1 font-semibold text-[#A78BFA] hover:text-white">Profile <ArrowRight className="h-3 w-3"/></a></div>
          </div>
        </div>
        {message && <div className={`mt-6 flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${message.type==="success"?"border-emerald-500/30 bg-emerald-500/10 text-emerald-200":"border-red-500/30 bg-red-500/10 text-red-200"}`}><span>{message.text}</span><button onClick={()=>setMessage(null)} className="icon-button h-7 w-7 shrink-0"><X className="h-3.5 w-3.5"/></button></div>}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">{categories.map(cat=><button key={cat} onClick={()=>setFilter(cat)} className={`whitespace-nowrap shrink-0 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition ${filter===cat?"bg-[#8B5CF6] text-white shadow-glow-sm":"border border-[#252B38] bg-[#121620] text-[#8B93A3] hover:border-[#8B5CF6]/40 hover:text-[#A78BFA]"}`}>{cat==="all"?"All":cat}</button>)}</div>
          <div className="relative w-full lg:w-[320px] shrink-0"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6878]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search rewards..." className="field pl-10 h-[42px] w-full rounded-xl"/></div>
        </div>
        {loading ? (
          <div className="mt-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="surface-panel overflow-hidden p-0 animate-pulse"><div className="h-40 bg-[#0D1017]" /><div className="p-5 space-y-3"><div className="h-4 w-2/3 rounded bg-[#252B38]" /><div className="h-3 w-full rounded bg-[#252B38]/70" /><div className="h-8 w-full rounded bg-[#252B38]" /></div></div>)}</div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 surface-panel flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#A78BFA] text-xl">!</div>
            <p className="font-display font-bold text-[#F5F7FA]">No rewards found</p>
            <p className="max-w-sm text-sm text-[#8B93A3]">Try another category or clear search. New drops land weekly.</p>
            <button onClick={() => { setFilter("all"); setQuery(""); }} className="mt-2 btn-accent-outline rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest">Clear filters</button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(item => {
              const isHttp = item.imageUrl?.startsWith("http");
              const outOfStock = item.stock !== null && (item.stockRemaining ?? 0) <= 0;
              const canAfford = balance >= item.costInPoints;
              return (
                <div key={item._id} className="group flex flex-col overflow-hidden rounded-2xl border border-[#252B38] bg-[#121620] transition duration-300 hover:-translate-y-1 hover:border-[#8B5CF6]/50 hover:shadow-[0_16px_40px_rgba(0,0,0,.45)]">
                  <div className="relative flex h-40 items-center justify-center overflow-hidden bg-[#0D1017]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/15 via-transparent to-[#22D3EE]/10 opacity-60 group-hover:opacity-100 transition" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(139,92,246,0.15),transparent_60%)]" />
                    {isHttp ? <img src={item.imageUrl} alt={item.name} className="relative h-20 w-20 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,.5)] group-hover:scale-105 transition" loading="lazy" onError={e => ((e.target as HTMLImageElement).style.display = "none")} /> : <span className="relative text-5xl">{item.imageUrl || "🎁"}</span>}
                    <div className="absolute left-3 top-3 flex gap-1.5">{item.category && <span className="rounded-full border border-[#252B38] bg-[#121620]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8B93A3] backdrop-blur">{item.category}</span>}</div>
                    {item.stock !== null && <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur ${outOfStock ? "bg-red-500/15 text-red-300 border border-red-500/20" : "bg-[#121620]/80 text-[#A78BFA] border border-[#252B38]"}`}>{outOfStock ? "Out of stock" : `${item.stockRemaining} left`}</span>}
                    {!canAfford && !outOfStock && <span className="absolute bottom-3 rounded-full bg-[#08090D]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#5F6878] border border-[#252B38] backdrop-blur">Need {(item.costInPoints - balance).toLocaleString()} more</span>}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-base font-bold leading-tight text-[#F5F7FA] group-hover:text-[#A78BFA] line-clamp-1">{item.name}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-[#8B93A3] min-h-[40px]">{item.description || "Exclusive MisterTee reward."}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-[#252B38] pt-4">
                      <div><p className="text-[10px] font-bold uppercase tracking-widest text-[#5F6878]">Cost</p><p className="font-display text-lg font-bold text-[#F5F7FA]">{item.costInPoints.toLocaleString()} <span className="text-xs font-semibold text-[#A78BFA]">pts</span></p></div>
                      <button onClick={() => handleRedeem(item._id)} disabled={redeeming === item._id || outOfStock} className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition ${outOfStock ? "cursor-not-allowed border border-[#252B38] bg-[#0D1017] text-[#5F6878]" : redeeming === item._id ? "bg-[#8B5CF6]/60 text-white" : "btn-accent"}`}>{redeeming === item._id ? "Redeeming..." : outOfStock ? "Sold out" : "Redeem"}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-8 text-center text-xs text-[#5F6878]">Redemptions are reviewed before fulfilment. Abuse or alt farming will void your queue.</p>
      </main><Footer/></div>
  );
}
