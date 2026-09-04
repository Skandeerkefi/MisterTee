import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { getApiBaseUrl } from "@/lib/apiBase";
import GraphicalBackground from "@/components/GraphicalBackground";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const error = searchParams.get("error");
  const callbackToken = searchParams.get("token");

  useEffect(() => {
    if (!callbackToken) return;
    fetch(`${getApiBaseUrl()}/api/auth/me`, { headers: { Authorization: `Bearer ${callbackToken}` } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Invalid Kick session")))
      .then((data) => { setToken(callbackToken); setUser(data.user); localStorage.setItem("token", callbackToken); localStorage.setItem("user", JSON.stringify(data.user)); navigate("/", { replace: true }); })
      .catch(() => navigate("/login?error=session", { replace: true }));
  }, [callbackToken, navigate, setToken, setUser]);

  return <div className="relative flex min-h-screen flex-col text-white"><GraphicalBackground /><Navbar /><main className="relative z-10 flex flex-1 items-center justify-center px-6 py-16"><div className="surface-panel w-full max-w-md p-8 text-center"><div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B5CF6]/15 text-[#A78BFA]"><LogIn className="h-7 w-7" /></div><p className="section-kicker">Members only</p><h1 className="mt-2 font-display text-3xl font-bold">Enter with Kick</h1><p className="mt-3 text-sm leading-6 text-[#8B93A3]">Use your Kick account to sign in or create your MisterTee community profile. No separate password required.</p>{error && <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error === "kick-linked" ? "That Kick account is already linked to another profile." : "Kick sign-in could not be completed. Please try again."}</p>}<a href={`${getApiBaseUrl()}/api/auth/kick`} className="btn-accent mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 font-semibold"><LogIn className="h-4 w-4" /> Continue with Kick</a><p className="mt-5 text-xs text-[#5F6878]">Your Kick identity powers your MisterTee community account.</p></div></main><Footer /></div>;
}
