import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Activity, Check, ClipboardList, Coins, Database, Gauge, RefreshCw, Search, Shield, Store, Users, X, Pencil, Trash2, Plus, Gift, Package, Award, Sparkles, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { getApiBaseUrl } from "@/lib/apiBase";
import GraphicalBackground from "@/components/GraphicalBackground";

type Tab = "overview" | "users" | "redemptions" | "shop" | "ledger" | "games";
type Row = Record<string, any>;
type ShopForm = {
  name: string; description: string; imageUrl: string; costInPoints: string;
  category: "digital" | "physical" | "role" | "other";
  stockMode: "unlimited" | "limited"; stock: string; stockRemaining: string;
  displayOrder: string; active: boolean;
};
const emptyShopForm: ShopForm = { name: "", description: "", imageUrl: "", costInPoints: "", category: "other", stockMode: "unlimited", stock: "", stockRemaining: "", displayOrder: "0", active: true };

const tabs: { id: Tab; label: string; icon: typeof Shield }[] = [
  { id: "overview", label: "Overview", icon: Activity }, { id: "users", label: "Users", icon: Users },
  { id: "redemptions", label: "Redemptions", icon: ClipboardList }, { id: "shop", label: "Shop", icon: Store },
  { id: "ledger", label: "Ledger", icon: Database }, { id: "games", label: "Game config", icon: Gauge },
];

export default function AdminPanelPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<Row[]>([]);
  const [redemptions, setRedemptions] = useState<Row[]>([]);
  const [shopItems, setShopItems] = useState<Row[]>([]);
  const [transactions, setTransactions] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [pointAmount, setPointAmount] = useState("");
  const [pointReason, setPointReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Row | null>(null);
  const [shopForm, setShopForm] = useState<ShopForm>(emptyShopForm);
  const [shopSearch, setShopSearch] = useState("");
  const [shopCategory, setShopCategory] = useState<string>("all");
  const [shopSaving, setShopSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const token = localStorage.getItem("token") || "";
  const base = getApiBaseUrl();
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  const request = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(`${base}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
    const text = await response.text();
    let data: any = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
    if (!response.ok) throw new Error(data.error || data.message || "Request failed");
    return data;
  };

  const load = async (nextTab = tab) => {
    setLoading(true); setMessage("");
    try {
      if (nextTab === "users") setUsers(await request(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ""}`));
      if (nextTab === "redemptions") setRedemptions(await request("/api/admin/redemptions"));
      if (nextTab === "shop") setShopItems(await request("/api/admin/shop-items"));
      if (nextTab === "ledger") setTransactions((await request("/api/admin/transactions?limit=100")).transactions || []);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load data"); }
    setLoading(false);
  };

  useEffect(() => { load(tab); }, [tab]);

  const runAction = async (action: () => Promise<unknown>, success: string) => { try { await action(); setMessage(success); await load(tab); } catch (error) { setMessage(error instanceof Error ? error.message : "Action failed"); } };
  const adjustPoints = () => { const userId = prompt("User ID"); const amount = prompt("Amount (+/-)"); if (userId && amount) runAction(() => request("/api/admin/points/adjust", { method: "POST", body: JSON.stringify({ userId, amount: Number(amount), reason: "Manual admin adjustment" }) }), "Balance adjusted"); };
  const changeSelectedPoints = (mode: "add" | "remove" | "set") => { const amount = Number(pointAmount); if (!selectedUserId || !Number.isFinite(amount) || amount < 0) { setMessage("Select a user and enter a valid point amount"); return; } const path = mode === "set" ? "/api/admin/points/set" : "/api/admin/points/adjust"; const body = mode === "set" ? { userId: selectedUserId, balance: amount, reason: pointReason || "Admin balance edit" } : { userId: selectedUserId, amount: mode === "remove" ? -amount : amount, reason: pointReason || `Admin points ${mode}` }; runAction(() => request(path, { method: "POST", body: JSON.stringify(body) }), mode === "set" ? "Balance updated" : `Points ${mode === "add" ? "added" : "removed"}`); };
  const updateFulfillment = (id: string, fulfillmentStatus: string) => runAction(() => request(`/api/admin/redemptions/${id}/fulfillment`, { method: "PUT", body: JSON.stringify({ fulfillmentStatus }) }), "Fulfillment updated");
  // Shop studio
  const openAddModal = () => { setEditingItem(null); setShopForm(emptyShopForm); setShopModalOpen(true); };
  const openEditModal = (item: Row) => {
    setEditingItem(item);
    setShopForm({
      name: item.name || "", description: item.description || "", imageUrl: item.imageUrl || "",
      costInPoints: String(item.costInPoints ?? ""), category: (item.category as ShopForm["category"]) || "other",
      stockMode: item.stock === null ? "unlimited" : "limited",
      stock: item.stock === null ? "" : String(item.stock ?? ""),
      stockRemaining: item.stockRemaining === null || item.stockRemaining === undefined ? "" : String(item.stockRemaining),
      displayOrder: String(item.displayOrder ?? 0), active: item.active !== false,
    });
    setShopModalOpen(true);
  };
  const closeShopModal = () => { if (shopSaving) return; setShopModalOpen(false); setEditingItem(null); setShopForm(emptyShopForm); };
  const handleShopSave = async () => {
    if (!shopForm.name.trim()) { setMessage("Product name is required"); return; }
    const cost = Number(shopForm.costInPoints);
    if (!Number.isFinite(cost) || cost < 0) { setMessage("Cost must be a valid non-negative number"); return; }
    const isLimited = shopForm.stockMode === "limited";
    const stockVal = isLimited ? Number(shopForm.stock) : null;
    const remainingVal = isLimited ? (shopForm.stockRemaining === "" ? stockVal : Number(shopForm.stockRemaining)) : null;
    if (isLimited && (!Number.isFinite(stockVal as number) || (stockVal as number) < 0)) { setMessage("Stock must be a valid quantity or switch to unlimited"); return; }
    setShopSaving(true);
    try {
      const payload: any = {
        name: shopForm.name.trim(), description: shopForm.description.trim(), imageUrl: shopForm.imageUrl.trim(),
        costInPoints: cost, category: shopForm.category, stock: stockVal, stockRemaining: remainingVal,
        displayOrder: Number(shopForm.displayOrder) || 0, active: shopForm.active,
      };
      if (editingItem) { await request(`/api/admin/shop-items/${editingItem._id}`, { method: "PUT", body: JSON.stringify(payload) }); setMessage(`Updated — ${payload.name}`); }
      else { await request("/api/admin/shop-items", { method: "POST", body: JSON.stringify(payload) }); setMessage(`Created — ${payload.name}`); }
      setShopModalOpen(false); setEditingItem(null); setShopForm(emptyShopForm); await load("shop");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Save failed"); }
    setShopSaving(false);
  };
  const handleDelete = async (item: Row) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeletingId(item._id);
    try { await request(`/api/admin/shop-items/${item._id}`, { method: "DELETE" }); setMessage(`Deleted — ${item.name}`); await load("shop"); } catch (e) { setMessage(e instanceof Error ? e.message : "Delete failed"); }
    setDeletingId(null);
  };
  const toggleActive = async (item: Row) => { try { await request(`/api/admin/shop-items/${item._id}`, { method: "PUT", body: JSON.stringify({ active: !item.active }) }); await load("shop"); } catch (e) { setMessage(e instanceof Error ? e.message : "Toggle failed"); } };

  const statCards = [
    { label: "Registered users", value: users.length || "--", icon: Users },
    { label: "Pending redemptions", value: redemptions.filter((r) => r.status === "pending").length || "--", icon: ClipboardList },
    { label: "Ledger events", value: transactions.length || "--", icon: Database },
    { label: "Active inventory", value: shopItems.filter((item) => item.active).length || "--", icon: Store },
  ];
  const filteredShop = shopItems.filter((it) => {
    if (shopCategory !== "all" && it.category !== shopCategory) return false;
    if (shopSearch.trim()) {
      const q = shopSearch.toLowerCase();
      const hay = `${it.name||""} ${it.description||""} ${it.category||""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const shopCats = ["all", ...Array.from(new Set(shopItems.map((i)=> String(i.category||"other"))))] as string[];
  const isHttpImg = (u: string) => /^https?:\/\//.test(u||"");

  return <div className="relative flex min-h-screen flex-col text-[#F5F7FA]"><GraphicalBackground /><Navbar /><main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
    <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[#252B38] pb-7 sm:flex-row sm:items-end"><div><p className="section-kicker">Restricted operations</p><h1 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Admin control room</h1><p className="mt-2 text-sm text-[#8B93A3]">Balances, rewards, redemptions and game rules in one place.</p></div><div className="flex items-center gap-2 text-xs text-[#8B93A3]"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Signed in as {user.kickUsername}</div></div>
    <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">{statCards.map(({ label, value, icon: Icon }) => <div key={label} className="surface-panel p-4"><Icon className="mb-5 h-4 w-4 text-[#A78BFA]" /><p className="font-display text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-[#5F6878]">{label}</p></div>)}</div>
    <div className="grid gap-4 sm:gap-8 lg:grid-cols-[220px_1fr]"><aside className="surface-panel h-fit p-2">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${tab === id ? "bg-[#8B5CF6]/15 text-[#A78BFA]" : "text-[#8B93A3] hover:bg-[#181D27] hover:text-white"}`}><Icon className="h-4 w-4" />{label}</button>)}</aside>
      <section className="min-w-0">{message && <div className="mb-5 flex items-center justify-between rounded-lg border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-4 py-3 text-sm text-[#A78BFA]">{message}<button onClick={() => setMessage("")}><X className="h-4 w-4" /></button></div>}
        {tab === "overview" && <div className="grid gap-4 sm:grid-cols-2"><button onClick={() => setTab("users")} className="surface-panel group p-6 text-left hover:border-[#8B5CF6]/60"><Coins className="mb-8 h-5 w-5 text-[#A78BFA]" /><h2 className="font-display text-xl font-bold">Adjust points</h2><p className="mt-2 text-sm text-[#8B93A3]">Create an auditable admin credit or debit for any user.</p></button><button onClick={() => setTab("redemptions")} className="surface-panel group p-6 text-left hover:border-[#8B5CF6]/60"><ClipboardList className="mb-8 h-5 w-5 text-[#A78BFA]" /><h2 className="font-display text-xl font-bold">Review redemptions</h2><p className="mt-2 text-sm text-[#8B93A3]">Approve, reject, refund, and update fulfillment status.</p></button><button onClick={() => setTab("ledger")} className="surface-panel group p-6 text-left hover:border-[#8B5CF6]/60"><Shield className="mb-8 h-5 w-5 text-[#A78BFA]" /><h2 className="font-display text-xl font-bold">Audit ledger</h2><p className="mt-2 text-sm text-[#8B93A3]">Inspect every balance movement and its resulting balance.</p></button></div>}
        {tab === "users" && <Panel title="Viewer accounts" action={<button onClick={() => load("users")} className="icon-button" title="Refresh users"><RefreshCw className="h-4 w-4" /></button>}><div className="mb-4 flex gap-2"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Kick username" className="field flex-1" /><button onClick={() => load("users")} className="btn-accent rounded-lg px-4"><Search className="h-4 w-4" /></button></div><div className="mb-6 rounded-xl border border-[#8B5CF6]/30 bg-[#0D1017] p-4"><div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#F5F7FA]"><Coins className="h-4 w-4 text-[#A78BFA]" />Manage user points</div><div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1.4fr_auto]"><select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="field"><option value="">Select a user</option>{users.map((u) => <option key={u._id} value={u._id}>{u.kickUsername} · {(u.pointsBalance || 0).toLocaleString()} pts</option>)}</select><input type="number" min="0" value={pointAmount} onChange={(e) => setPointAmount(e.target.value)} placeholder="Points" className="field" /><input value={pointReason} onChange={(e) => setPointReason(e.target.value)} placeholder="Reason (optional)" className="field" /><div className="flex gap-2"><button onClick={() => changeSelectedPoints("add")} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25">Add</button><button onClick={() => changeSelectedPoints("remove")} className="rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/25">Remove</button><button onClick={() => changeSelectedPoints("set")} className="btn-accent rounded-lg px-3 py-2 text-xs">Set</button></div></div><p className="text-xs text-[#5F6878]">Set replaces the current balance; every change is recorded in the points ledger.</p></div><Table headers={["Kick", "Discord", "Balance", "Linked"]} rows={users.map((u) => [u.kickUsername, u.discordUsername || "Not linked", `${(u.pointsBalance || 0).toLocaleString()} pts`, `${u.hasLinkedKick ? "Kick" : ""}${u.hasLinkedDiscord ? " + Discord" : ""}` || "None"])} /></Panel>}
        {tab === "redemptions" && <Panel title="Redemption queue" action={<button onClick={() => load("redemptions")} className="icon-button" title="Refresh redemptions"><RefreshCw className="h-4 w-4" /></button>}><Table headers={["Viewer", "Item", "Cost", "Status", "Fulfillment", "Actions"]} rows={redemptions.map((r) => [r.user?.kickUsername || "Unknown", r.shopItem?.name || "Deleted item", `${r.costPaid} pts`, r.status, <select value={r.fulfillmentStatus || "pending"} onChange={(e) => updateFulfillment(r._id, e.target.value)} className="field py-1"><option>pending</option><option>granted</option><option>shipped</option><option>delivered</option><option>cancelled</option></select>, r.status === "pending" ? <span className="flex gap-2"><button onClick={() => runAction(() => request(`/api/admin/redemptions/${r._id}/approve`, { method: "PUT" }), "Redemption approved")} className="icon-button text-emerald-400" title="Approve"><Check className="h-4 w-4" /></button><button onClick={() => runAction(() => request(`/api/admin/redemptions/${r._id}/reject`, { method: "PUT", body: "{}" }), "Redemption rejected and refunded")} className="icon-button text-red-400" title="Reject"><X className="h-4 w-4" /></button></span> : "Resolved"])} /></Panel>}
        {tab === "shop" && (
  <div className="space-y-4">
    <div className="surface-panel overflow-hidden">
      <div className="border-b border-[#252B38] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-display text-xl font-bold flex items-center gap-2"><Store className="h-5 w-5 text-[#A78BFA]"/> Shop inventory</h2><p className="mt-1 text-xs text-[#8B93A3]">{shopItems.length} products \u00b7 {shopItems.filter(i=>i.active).length} live \u00b7 {shopItems.filter(i=>i.active===false).length} hidden</p></div>
          <button onClick={openAddModal} className="btn-accent inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-widest"><Plus className="h-4 w-4"/> Add product</button>
        </div>
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mx-5 px-5 lg:mx-0 lg:px-0">{shopCats.map((c)=> (<button key={c} onClick={()=>setShopCategory(c)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest border transition ${shopCategory===c ? "bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-glow-sm" : "bg-[#0D1017] text-[#8B93A3] border-[#252B38] hover:border-[#8B5CF6]/40 hover:text-[#A78BFA]"}`}>{c}</button>))}</div>
          <div className="flex gap-2 w-full lg:w-auto"><div className="relative flex-1 lg:w-[280px]"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6878]"/><input value={shopSearch} onChange={(e)=>setShopSearch(e.target.value)} placeholder="Search products..." className="field pl-9 h-[40px]"/></div><button onClick={()=>load("shop")} className="icon-button h-[40px] w-[40px] shrink-0" title="Refresh"><RefreshCw className="h-4 w-4"/></button></div>
        </div>
      </div>
      {loading ? (
                    <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:6}).map((_,i)=><div key={i} className="rounded-2xl border border-[#252B38] bg-[#0D1017] p-0 overflow-hidden animate-pulse"><div className="h-40 bg-[#121620]"/><div className="p-4 space-y-2"><div className="h-4 w-2/3 rounded bg-[#252B38]"/><div className="h-3 w-full rounded bg-[#252B38]/60"/></div></div>)}</div>
                  ) : filteredShop.length===0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20"><Gift className="h-7 w-7 text-[#A78BFA]"/></div><p className="font-display font-bold">No products found</p><p className="max-w-sm text-sm text-[#8B93A3]">{shopItems.length===0 ? "Your vault is empty. Add your first reward to start." : "No match for your filters. Try another category or clear search."}</p>{shopItems.length===0 ? <button onClick={openAddModal} className="btn-accent mt-2 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest">Add first product</button> : <button onClick={()=>{setShopSearch(""); setShopCategory("all");}} className="btn-accent-outline mt-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest">Clear filters</button>}</div>
                  ) : (
                    <div className="p-4 sm:p-5"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredShop.map((item)=>{ const outOfStock = item.stock !== null && (item.stockRemaining??0) <= 0; return (<div key={item._id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#252B38] bg-[#0D1017] transition hover:border-[#8B5CF6]/40 hover:shadow-[0_12px_40px_rgba(0,0,0,.4)]"><div className="relative flex h-44 items-center justify-center overflow-hidden bg-[#121620]"><div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/15 via-transparent to-[#22D3EE]/10 opacity-70 group-hover:opacity-100 transition"/><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(139,92,246,.12),transparent_60%)]"/>{isHttpImg(item.imageUrl) ? <img src={item.imageUrl} alt={item.name} className="relative h-20 w-20 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,.5)]" loading="lazy" onError={(e)=> ((e.target as HTMLImageElement).style.display="none")} /> : <span className="relative text-5xl drop-shadow-lg">{item.imageUrl || "\uD83C\uDF81"}</span>}<div className="absolute left-3 top-3 flex gap-1.5"><span className="rounded-full border border-[#252B38] bg-[#0D1017]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8B93A3] backdrop-blur">{item.category||"other"}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border backdrop-blur ${item.active ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-[#252B38] text-[#8B93A3] border-[#252B38]"}`}>{item.active ? "Live" : "Hidden"}</span></div><div className="absolute right-3 top-3"><button onClick={()=>toggleActive(item)} title={item.active?"Hide":"Make live"} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0D1017]/80 border border-[#252B38] backdrop-blur hover:border-[#8B5CF6]/40 text-[#8B93A3] hover:text-white">{item.active ? <Eye className="h-3.5 w-3.5"/> : <EyeOff className="h-3.5 w-3.5"/>}</button></div>{item.stock !== null && <span className={`absolute right-3 bottom-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border backdrop-blur ${outOfStock ? "bg-red-500/15 text-red-300 border-red-500/20" : "bg-[#0D1017]/80 text-[#A78BFA] border-[#252B38]"}`}>{outOfStock ? "Out of stock" : `${item.stockRemaining} left`}</span>}{item.stock===null && <span className="absolute bottom-3 right-3 rounded-full bg-[#0D1017]/70 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#5F6878] border border-[#252B38] backdrop-blur">Unlimited</span>}</div><div className="flex flex-1 flex-col p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-display text-sm font-bold leading-tight line-clamp-1 text-[#F5F7FA] flex-1">{item.name}</h3><span className="shrink-0 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/20 px-2.5 py-1 text-xs font-bold text-[#A78BFA]">{Number(item.costInPoints).toLocaleString()} pts</span></div><p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#8B93A3] min-h-[32px]">{item.description || "Exclusive MisterTee reward."}</p><div className="mt-3 flex items-center justify-between border-t border-[#252B38] pt-3"><span className="text-[11px] text-[#5F6878]">#{String(item.displayOrder ?? 0)} \u00b7 {item.stock===null ? "\u221e stock" : `${item.stock} stock`}</span><div className="flex gap-1.5"><button onClick={()=>openEditModal(item)} className="inline-flex h-8 items-center gap-1 rounded-full border border-[#252B38] bg-[#121620] px-3 text-xs font-semibold text-[#8B93A3] hover:border-[#8B5CF6]/40 hover:text-white"><Pencil className="h-3 w-3"/> Edit</button><button onClick={()=>handleDelete(item)} disabled={deletingId===item._id} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5"/></button></div></div></div></div>); })}</div></div>
                  )}
                </div>
              </div>
            )}
        {tab === "ledger" && <Panel title="Points ledger" action={<button onClick={() => load("ledger")} className="icon-button" title="Refresh ledger"><RefreshCw className="h-4 w-4" /></button>}><Table headers={["Date", "User", "Type", "Amount", "Balance after"]} rows={transactions.map((tx) => [new Date(tx.createdAt).toLocaleString(), tx.user?.kickUsername || tx.user, tx.type, <span className={tx.amount >= 0 ? "text-emerald-400" : "text-red-400"}>{tx.amount > 0 ? "+" : ""}{tx.amount}</span>, tx.balanceAfter])} /></Panel>}
        {tab === "games" && <GameConfig request={request} onMessage={setMessage} />}
        {loading && <p className="mt-5 text-sm text-[#8B93A3]">Loading control data...</p>}
      </section></div>
  </main>
      {/* Vault Shop Studio Modal — premium formulaire */}
      {shopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#08090D]/80 backdrop-blur-sm" onClick={closeShopModal}/>
          <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#252B38] bg-[#121620] shadow-[0_24px_80px_rgba(0,0,0,.6)]">
            <div className="relative shrink-0 border-b border-[#252B38] bg-gradient-to-br from-[#8B5CF6]/10 via-[#121620] to-[#22D3EE]/5 px-6 py-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(139,92,246,.12),transparent_55%)]"/>
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/20 shrink-0"><Gift className="h-5 w-5 text-[#A78BFA]"/></div>
                  <div>
                    <p className="section-kicker flex items-center gap-1.5 text-[10px]"><Sparkles className="h-3 w-3"/> Vault studio</p>
                    <h3 className="font-display text-lg font-bold">{editingItem ? "Edit reward" : "Add vault reward"}</h3>
                    <p className="text-xs text-[#8B93A3]">{editingItem ? "Update the live vault listing — changes reflect instantly on /shop." : "Craft a new reward. Polished, audited, fulfilled by the team."}</p>
                  </div>
                </div>
                <button onClick={closeShopModal} className="icon-button h-8 w-8 shrink-0 bg-[#0D1017]"><X className="h-4 w-4"/></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="rounded-xl border border-[#252B38] bg-[#0D1017] overflow-hidden">
                <div className="relative flex h-40 items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/15 via-transparent to-[#22D3EE]/10"/>
                  {isHttpImg(shopForm.imageUrl) ? <img src={shopForm.imageUrl} alt="preview" className="relative h-20 w-20 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,.5)]" onError={(e)=> ((e.target as HTMLImageElement).style.display="none")} /> : <span className="relative text-5xl">{shopForm.imageUrl || "🎁"}</span>}
                  <span className="absolute left-3 top-3 rounded-full border border-[#252B38] bg-[#121620]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8B93A3] backdrop-blur">{shopForm.category}</span>
                  <span className="absolute right-3 top-3 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/20 px-2.5 py-1 text-xs font-bold text-[#A78BFA]">{shopForm.costInPoints ? Number(shopForm.costInPoints).toLocaleString() : "—"} pts</span>
                </div>
                <div className="border-t border-[#252B38] px-4 py-3">
                  <p className="font-display text-sm font-bold line-clamp-1">{shopForm.name || "Reward name"}</p>
                  <p className="text-xs text-[#8B93A3] line-clamp-2">{shopForm.description || "Reward description preview."}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2 space-y-1.5"><span className="text-[11px] font-bold uppercase tracking-widest text-[#8B93A3]">Product name *</span><input value={shopForm.name} onChange={(e)=>setShopForm({...shopForm, name:e.target.value})} placeholder="e.g. MisterTee Gold Tee - 1 of 1" className="field h-[42px]" maxLength={200}/></label>
                <label className="sm:col-span-2 space-y-1.5"><span className="text-[11px] font-bold uppercase tracking-widest text-[#8B93A3]">Description</span><textarea value={shopForm.description} onChange={(e)=>setShopForm({...shopForm, description:e.target.value})} placeholder="What the viewer receives and how it is fulfilled..." rows={3} className="field min-h-[86px] resize-none py-2.5" maxLength={2000}/><span className="text-[11px] text-[#5F6878]">{shopForm.description.length}/2000</span></label>
                <label className="space-y-1.5"><span className="text-[11px] font-bold uppercase tracking-widest text-[#8B93A3] flex items-center gap-1"><ImageIcon className="h-3 w-3"/> Image URL or emoji</span><input value={shopForm.imageUrl} onChange={(e)=>setShopForm({...shopForm, imageUrl:e.target.value})} placeholder="https://... or gift" className="field h-[42px]"/><span className="text-[11px] text-[#5F6878]">Direct link or single emoji. Falls back to gift.</span></label>
                <label className="space-y-1.5"><span className="text-[11px] font-bold uppercase tracking-widest text-[#8B93A3]">Category</span><select value={shopForm.category} onChange={(e)=>setShopForm({...shopForm, category:e.target.value as any})} className="field h-[42px]"><option value="other">Other</option><option value="digital">Digital</option><option value="physical">Physical</option><option value="role">Role</option></select></label>
                <label className="space-y-1.5"><span className="text-[11px] font-bold uppercase tracking-widest text-[#8B93A3] flex items-center gap-1"><Coins className="h-3 w-3"/> Cost (points) *</span><input type="number" min={0} value={shopForm.costInPoints} onChange={(e)=>setShopForm({...shopForm, costInPoints:e.target.value})} placeholder="20" className="field h-[42px]"/></label>
                <label className="space-y-1.5"><span className="text-[11px] font-bold uppercase tracking-widest text-[#8B93A3]">Display order</span><input type="number" value={shopForm.displayOrder} onChange={(e)=>setShopForm({...shopForm, displayOrder:e.target.value})} placeholder="0" className="field h-[42px]"/><span className="text-[11px] text-[#5F6878]">Lower shows first on /shop.</span></label>

                <div className="sm:col-span-2 rounded-xl border border-[#252B38] bg-[#0D1017] p-4 space-y-3">
                  <div className="flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-widest text-[#8B93A3] flex items-center gap-1"><Package className="h-3.5 w-3.5"/> Stock</span><div className="flex rounded-full border border-[#252B38] bg-[#121620] p-1 text-xs"><button type="button" onClick={()=>setShopForm({...shopForm, stockMode:"unlimited"})} className={`rounded-full px-3 py-1.5 font-bold transition ${shopForm.stockMode==="unlimited" ? "bg-[#8B5CF6] text-white" : "text-[#8B93A3] hover:text-white"}`}>Unlimited</button><button type="button" onClick={()=>setShopForm({...shopForm, stockMode:"limited"})} className={`rounded-full px-3 py-1.5 font-bold transition ${shopForm.stockMode==="limited" ? "bg-[#8B5CF6] text-white" : "text-[#8B93A3] hover:text-white"}`}>Limited</button></div></div>
                  {shopForm.stockMode==="limited" ? (
                    <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1.5"><span className="text-xs text-[#8B93A3]">Total stock</span><input type="number" min={0} value={shopForm.stock} onChange={(e)=>setShopForm({...shopForm, stock:e.target.value, stockRemaining: shopForm.stockRemaining==="" ? e.target.value : shopForm.stockRemaining})} placeholder="100" className="field h-[40px]"/></label><label className="space-y-1.5"><span className="text-xs text-[#8B93A3]">Remaining</span><input type="number" min={0} value={shopForm.stockRemaining} onChange={(e)=>setShopForm({...shopForm, stockRemaining:e.target.value})} placeholder={shopForm.stock||"auto = total"} className="field h-[40px]"/></label><p className="sm:col-span-2 text-[11px] text-[#5F6878]">Leave remaining empty to start at full stock.</p></div>
                  ) : <p className="text-xs text-[#8B93A3]">Unlimited stock — never sold out. Ideal for digital / role rewards.</p>}
                </div>

                <label className="sm:col-span-2 flex items-center justify-between rounded-xl border border-[#252B38] bg-[#0D1017] px-4 py-3 cursor-pointer"><span className="text-sm font-semibold flex items-center gap-2"><Award className="h-4 w-4 text-[#A78BFA]"/> Live on shop</span><span className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${shopForm.active ? "bg-[#8B5CF6]" : "bg-[#252B38]"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${shopForm.active ? "translate-x-6" : "translate-x-1"}`}/><input type="checkbox" checked={shopForm.active} onChange={(e)=>setShopForm({...shopForm, active:e.target.checked})} className="sr-only"/></span></label>
              </div>
            </div>
            <div className="shrink-0 flex items-center justify-between gap-3 border-t border-[#252B38] bg-[#0D1017]/50 px-6 py-4">
              <button onClick={closeShopModal} disabled={shopSaving} className="rounded-full border border-[#252B38] bg-[#121620] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#8B93A3] hover:border-[#8B5CF6]/40 hover:text-white disabled:opacity-40">Cancel</button>
              <button onClick={handleShopSave} disabled={shopSaving} className="btn-accent rounded-full px-7 py-2.5 text-xs font-bold uppercase tracking-widest disabled:opacity-50">{shopSaving ? "Saving..." : editingItem ? "Save changes" : "Create product"}</button>
            </div>
          </div>
        </div>
      )}

<Footer /></div>;
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) { return <div className="surface-panel overflow-hidden"><div className="flex items-center justify-between border-b border-[#252B38] px-5 py-4"><h2 className="font-display text-xl font-bold">{title}</h2>{action}</div><div className="p-5">{children}</div></div>; }
function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) { return <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-[#252B38] text-[10px] uppercase tracking-widest text-[#5F6878]">{headers.map((header) => <th key={header} className="px-3 py-3 font-semibold">{header}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={index} className="border-b border-[#252B38]/70 text-[#8B93A3] last:border-0 hover:bg-[#181D27]/60">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-3">{cell}</td>)}</tr>) : <tr><td colSpan={headers.length} className="px-3 py-10 text-center text-[#5F6878]">No records found.</td></tr>}</tbody></table></div>; }
function GameConfig({ request, onMessage }: { request: (path: string, options?: RequestInit) => Promise<any>; onMessage: (message: string) => void }) { const [game, setGame] = useState("coinflip"); const [values, setValues] = useState({ minWager: 10, maxWager: 10000, dailyLossCap: 5000, active: true }); const save = async () => { try { await request(`/api/admin/game-configs/${game}`, { method: "PUT", body: JSON.stringify(values) }); onMessage(`${game} configuration saved`); } catch (error) { onMessage(error instanceof Error ? error.message : "Unable to save game config"); } }; return <Panel title="Game safeguards and limits"><div className="grid max-w-xl gap-4 sm:grid-cols-2"><label className="text-xs text-[#8B93A3]">Game<select value={game} onChange={(e) => setGame(e.target.value)} className="field mt-2"><option>coinflip</option><option>mines</option></select></label>{(["minWager", "maxWager", "dailyLossCap"] as const).map((key) => <label key={key} className="text-xs text-[#8B93A3]">{key}<input type="number" value={values[key]} onChange={(e) => setValues({ ...values, [key]: Number(e.target.value) })} className="field mt-2" /></label>)}<label className="flex items-center gap-2 text-sm text-[#8B93A3]"><input type="checkbox" checked={values.active} onChange={(e) => setValues({ ...values, active: e.target.checked })} /> Game enabled</label></div><button onClick={save} className="btn-accent mt-6 rounded-lg px-4 py-2 text-sm">Save configuration</button></Panel>; }


