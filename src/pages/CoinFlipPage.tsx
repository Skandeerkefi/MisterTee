import { useState, useEffect } from "react"; import { Navbar } from "@/components/Navbar"; import { Footer } from "@/components/Footer"; import { Button } from "@/components/ui/button"; import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; import { useGameStore } from "@/store/useGameStore"; import { usePointsStore } from "@/store/usePointsStore"; import { useAuthStore } from "@/store/useAuthStore"; import { RefreshCw } from "lucide-react"; import GraphicalBackground from "@/components/GraphicalBackground";

export default function CoinFlipPage() {
  const { user } = useAuthStore();
  const { config, isPlaying, error, fetchConfig, playCoinFlip, fetchHistory, history } = useGameStore();
  const { profile, fetchProfile } = usePointsStore();
  const [wager, setWager] = useState(100);
  const [selectedSide, setSelectedSide] = useState<"heads" | "tails">("heads");
  const [result, setResult] = useState<any>(null);

  useEffect(() => { fetchConfig("coinflip"); fetchHistory("coinflip"); fetchProfile(); }, []);

  const handlePlay = async () => { const r = await playCoinFlip(wager, selectedSide); if (r.success) { setResult(r); fetchProfile(); } else alert(r.error); };
  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <div className="relative flex flex-col min-h-screen text-white">
      <GraphicalBackground />
      <Navbar />
      <main className="relative z-10 flex-1 max-w-3xl w-full px-4 py-8 sm:px-6 sm:py-12 mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 text-[#F5F7FA]">Coin Flip</h1>
        <div className="flex gap-2 sm:gap-4 justify-center flex-wrap mb-6">
          <div className="px-6 py-3 bg-black/60 backdrop-blur rounded-xl border border-[#E10600]">
            <span className="text-gray-400 text-sm">Balance</span>
            <p className="text-xl font-bold">{(profile?.balance || user?.pointsBalance || 0).toLocaleString()} pts</p>
          </div>
          {config && <><div className="px-6 py-3 bg-black/60 backdrop-blur rounded-xl border border-gray-700"><span className="text-gray-400 text-sm">Min</span><p className="text-lg font-bold">{config.minWager.toLocaleString()}</p></div><div className="px-6 py-3 bg-black/60 backdrop-blur rounded-xl border border-gray-700"><span className="text-gray-400 text-sm">Max</span><p className="text-lg font-bold">{config.maxWager.toLocaleString()}</p></div></>}
        </div>
        <Card className="bg-black/70 backdrop-blur border-[#E10600] mb-6">
          <CardHeader><CardTitle>Choose Side</CardTitle></CardHeader>
          <CardContent className="flex justify-center gap-4 sm:gap-8">
            <button onClick={() => setSelectedSide("heads")} className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center text-3xl font-bold transition-all ${selectedSide === "heads" ? "bg-yellow-600 border-4 border-yellow-400 scale-110" : "bg-gray-700 border-4 border-gray-600 hover:border-yellow-600"}`}>H<span className="text-sm mt-2">HEADS</span></button>
            <button onClick={() => setSelectedSide("tails")} className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center text-3xl font-bold transition-all ${selectedSide === "tails" ? "bg-blue-600 border-4 border-blue-400 scale-110" : "bg-gray-700 border-4 border-gray-600 hover:border-blue-600"}`}>T<span className="text-sm mt-2">TAILS</span></button>
          </CardContent>
        </Card>
        <Card className="bg-black/70 backdrop-blur border-gray-700 mb-6">
          <CardContent className="pt-6">
            <input type="number" value={wager} onChange={(e) => setWager(Number(e.target.value))} className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white text-center text-2xl mb-4" />
            <div className="flex gap-2 flex-wrap justify-center mb-4">{quickAmounts.map(a => <Button key={a} variant="outline" onClick={() => setWager(a)} className="border-gray-600 hover:bg-gray-800">{a}</Button>)}</div>
            <Button onClick={handlePlay} disabled={isPlaying || !config?.active} className="w-full bg-[#E10600] hover:bg-[#b00] text-xl py-6">{isPlaying ? "Flipping..." : "FLIP!"}</Button>
            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
          </CardContent>
        </Card>
        {result && (
          <Card className={`bg-black/70 backdrop-blur border mb-6 ${result.outcome === "win" ? "border-green-500" : "border-red-500"}`}>
            <CardContent className="text-center py-6">
              <p className={`text-3xl font-bold ${result.outcome === "win" ? "text-green-500" : "text-red-500"}`}>{result.outcome === "win" ? "YOU WIN!" : "YOU LOSE"}</p>
              {result.outcome === "win" && <p className="text-2xl text-white mt-2">+{result.gameRound?.payout?.toLocaleString()} pts!</p>}
              <p className="text-gray-400 mt-2">Result: {result.gameRound?.meta?.resultSide?.toUpperCase()}</p>
              <Button onClick={() => setResult(null)} variant="outline" className="mt-4 border-gray-600"><RefreshCw className="w-4 h-4 mr-2" />Play Again</Button>
            </CardContent>
          </Card>
        )}
        {history.length > 0 && (
          <Card className="bg-black/70 backdrop-blur border-gray-700">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-3">Recent Games</h3>
              {history.slice(0, 5).map((h) => (
                <div key={h._id} className="flex justify-between p-2 bg-black/40 rounded mb-1">
                  <span className={`px-2 py-1 rounded text-xs ${h.outcome === "win" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>{h.outcome.toUpperCase()}</span>
                  <span className="text-gray-300">Bet: {h.wager.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}


