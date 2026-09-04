import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Calendar, Flame, Check, Link2, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { usePointsStore } from "@/store/usePointsStore";
import { getApiBaseUrl } from "@/lib/apiBase";
import GraphicalBackground from "@/components/GraphicalBackground";

interface Transaction { _id: string; type: string; amount: number; }

export default function ProfilePage() {
  const { user, setUser, setToken } = useAuthStore();
  const { profile, fetchProfile, claimDailyLogin } = usePointsStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [claiming, setClaiming] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [authSyncing, setAuthSyncing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const urlToken = searchParams.get("token");
    const effectiveToken = urlToken || token;
    if (urlToken) {
      localStorage.setItem("token", urlToken);
      setToken(urlToken);
      const next = new URLSearchParams(searchParams);
      next.delete("token");
      setSearchParams(next, { replace: true });
    }
    setAuthSyncing(true);
    fetch(`${getApiBaseUrl()}/api/auth/me`, { headers: { Authorization: `Bearer ${effectiveToken}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (data?.user) { setUser(data.user); localStorage.setItem("user", JSON.stringify(data.user)); }
      })
      .catch(() => {})
      .finally(() => setAuthSyncing(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchProfile();
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${getApiBaseUrl()}/api/points/transactions?limit=10`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((data) => setTransactions(data.transactions || []))
      .catch(() => {});
  }, [fetchProfile]);

  useEffect(() => {
    if (searchParams.get("discord") === "linked" || searchParams.get("kick") === "linked") fetchProfile();
  }, [searchParams, fetchProfile]);

  if (!user) return <Navigate to="/login" />;

  const canClaim = !profile?.lastDailyLogin || new Date(profile.lastDailyLogin).toDateString() !== new Date().toDateString();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const discordLink = token ? `${getApiBaseUrl()}/api/oauth/discord?token=${encodeURIComponent(token)}` : `${getApiBaseUrl()}/api/oauth/discord`;
  const kickLink = token ? `${getApiBaseUrl()}/api/auth/kick?token=${encodeURIComponent(token)}` : `${getApiBaseUrl()}/api/auth/kick`;
  const isDiscordLinked = Boolean((user as any).hasLinkedDiscord || (user as any).discordId || user.discordUsername);
  const isKickLinked = Boolean((user as any).hasLinkedKick || (user as any).kickId || user.kickUsername);
  const error = searchParams.get("error");
  const discordLinked = searchParams.get("discord") === "linked";
  const kickLinked = searchParams.get("kick") === "linked";

  const handleClaim = async () => {
    setClaiming(true);
    await claimDailyLogin();
    setClaiming(false);
    await fetchProfile();
  };

  const dismissBanner = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("error"); next.delete("discord"); next.delete("kick");
    setSearchParams(next, { replace: true });
  };

  const errorMessage =
    error === "discord-linked" ? "That Discord account is already linked to another vault."
    : error === "discord-already-linked" ? "Your vault already has a Discord linked — one per account."
    : error === "kick-linked" ? "That Kick account is already linked to another vault."
    : error === "kick-already-linked" ? "Your vault already has a Kick linked — one per account."
    : error ? decodeURIComponent(error) : null;

  return <div className="relative flex min-h-screen flex-col text-white"><GraphicalBackground /><Navbar /><main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
    <p className="section-kicker text-center">Member area</p><h1 className="mt-2 mb-8 text-center font-display text-3xl sm:text-4xl font-bold">My Profile</h1>
    {(discordLinked || kickLinked || errorMessage) && (
      <div className="mb-6 space-y-3">
        {discordLinked && <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"><span className="flex items-center gap-2"><Check className="h-4 w-4" /> Discord linked to your vault.</span><button onClick={dismissBanner} className="text-emerald-300/70 hover:text-emerald-200">×</button></div>}
        {kickLinked && <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"><span className="flex items-center gap-2"><Check className="h-4 w-4" /> Kick linked to your vault.</span><button onClick={dismissBanner} className="text-emerald-300/70 hover:text-emerald-200">×</button></div>}
        {errorMessage && <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"><span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {errorMessage}</span><button onClick={dismissBanner} className="text-red-300/70 hover:text-red-200">×</button></div>}
      </div>
    )}
    <div className="mb-8 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
      <Card className="surface-panel"><CardContent className="pt-6"><h2 className="mb-4 font-display text-xl font-bold">Account</h2><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-[#8B93A3]">Kick</span><span className="flex items-center gap-1.5">{user.kickUsername || "Not linked"}{isKickLinked && <Check className="h-3.5 w-3.5 text-emerald-400" />}</span></div><div className="flex justify-between"><span className="text-[#8B93A3]">Discord</span><span className="flex items-center gap-1.5">{user.discordUsername || "Not linked"}{isDiscordLinked && <Check className="h-3.5 w-3.5 text-emerald-400" />}</span></div><div className="flex justify-between"><span className="text-[#8B93A3]">Balance</span><span className="font-bold text-[#A78BFA]">{(profile?.balance || 0).toLocaleString()} pts</span></div><div className="flex justify-between"><span className="text-[#8B93A3]">Lifetime</span><span>{(profile?.lifetimePoints || 0).toLocaleString()} pts</span></div></div><div className="mt-5 flex flex-wrap gap-2">{isDiscordLinked ? <span aria-disabled="true" title="Discord already linked — one per vault" className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-[#252B38] bg-[#121620] px-3 py-2 text-xs font-semibold text-[#5F6878] opacity-60"><Check className="h-3.5 w-3.5" /> Discord Linked</span> : <a href={discordLink} className="btn-accent-outline inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs"><Link2 className="h-3.5 w-3.5" /> Link Discord</a>}{isKickLinked ? <span aria-disabled="true" title="Kick already linked — one per vault" className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-[#252B38] bg-[#121620] px-3 py-2 text-xs font-semibold text-[#5F6878] opacity-60"><Check className="h-3.5 w-3.5" /> Kick Linked</span> : <a href={kickLink} className="btn-accent inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs"><Link2 className="h-3.5 w-3.5" /> Link Kick</a>}</div><p className="mt-3 text-[11px] leading-4 text-[#5F6878]">One Discord + one Kick per vault — linking is permanent.{authSyncing ? " Syncing…" : ""}</p></CardContent></Card>
      <Card className="surface-panel"><CardContent className="pt-6"><h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold"><Calendar className="h-5 w-5 text-[#22D3EE]" />Daily Bonus</h2><div className="mb-4 flex justify-between text-sm"><span className="text-[#8B93A3]">Streak</span><span className="flex items-center gap-1"><Flame className="h-4 w-4 text-[#A78BFA]" />{profile?.loginStreak || 0} days</span></div><Button onClick={handleClaim} disabled={!canClaim || claiming} className="btn-accent w-full">{claiming ? "Claiming..." : canClaim ? "Claim Bonus" : "Claimed Today"}</Button></CardContent></Card>
    </div>
    <Card className="surface-panel"><CardContent className="pt-6"><h2 className="mb-4 font-display text-xl font-bold">Recent Transactions</h2>{transactions.length === 0 ? <p className="py-4 text-center text-sm text-[#5F6878]">No transactions yet.</p> : transactions.map((transaction) => <div key={transaction._id} className="flex justify-between border-b border-[#252B38] py-3 text-sm last:border-0"><span className="text-[#8B93A3]">{transaction.type}</span><span className={transaction.amount >= 0 ? "text-emerald-400" : "text-red-400"}>{transaction.amount > 0 ? "+" : ""}{transaction.amount}</span></div>)}</CardContent></Card>
  </main><Footer /></div>;
}


