import { useEffect, useState } from "react";
import { useCSGOLeadStore } from "@/store/csgoleadStore";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import LeaderboardPodium from "@/components/LeaderboardPodium";
import dayjs from "dayjs";
import { getApiBaseUrl } from "@/lib/apiBase";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";

dayjs.extend(duration);
dayjs.extend(utc);

const CSGOLeadPage = () => {
  const { leaderboard, loading, error, fetchLeaderboard, dateStart, dateEnd } = useCSGOLeadStore();
  const [timeLeft, setTimeLeft] = useState("");
  const [prizes, setPrizes] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchLeaderboard(10);

      const res = await fetch(`${getApiBaseUrl()}/api/leaderboard/csgowin`);
      const data = await res.json();
      const currentLB = data.leaderboards?.[0];

      if (currentLB) {
        // ⛔ NO MORE REMOVING ZEROS — USE RAW VALUES
        setPrizes(currentLB.prizes);
      }
    };
    fetchData();
  }, [fetchLeaderboard]);

  useEffect(() => {
    const updateCountdown = () => {
      if (!dateEnd) return;

      const end = dayjs.utc(dateEnd);
      const now = dayjs.utc();
      const diff = end.diff(now);

      if (diff <= 0) {
        setTimeLeft("Leaderboard resetting...");
        return;
      }

      const d = dayjs.duration(diff);
      setTimeLeft(
        `${Math.floor(d.asDays())}d ${d.hours()}h ${d.minutes()}m ${d.seconds()}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [dateEnd]);

  const displayRange =
    dateStart && dateEnd
      ? `${dayjs.utc(dateStart).format("D MMM")} → ${dayjs.utc(dateEnd).format("D MMM")}`
      : "";

  const totalPrize = prizes.reduce((acc, p) => acc + p, 0);

  return (
    <div className="relative flex flex-col min-h-screen">
      <GraphicalBackground />
      <Navbar />

      <main className="relative z-10 flex-grow w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 mx-auto">
        <h1 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-[#F5F7FA] drop-shadow-lg">
          CSGOWIN Leaderboard – {totalPrize.toLocaleString()} C Prize Pool
        </h1>

        <p className="mb-2 text-center text-sm font-medium text-[#8B93A3]">
          Event Duration: <span className="font-bold text-[#A78BFA]">{displayRange || "—"} (UTC)</span>
        </p>

        <p className="mb-2 text-center text-md font-semibold text-[#F5F7FA]">
          ⏳ Time Remaining Until Next Reset: <span className="text-[#A78BFA] font-bold">{timeLeft || "—"}</span>
        </p>

        <p className="mb-8 text-center text-xs text-[#8B93A3]">
          Use code <span className="font-bold text-white">"MisterTee"</span> on csgowin.com/r/MisterTee — wager abuse is prohibited
        </p>

        {loading && <p className="mt-10 text-center text-[#8B93A3]">Loading...</p>}
        {error && <p className="mt-10 text-center text-[#e10600]">{error}</p>}

        {!loading && !error && (
          <>
            <LeaderboardPodium players={leaderboard.length > 0 ? leaderboard.slice(0, 3).map((entry, idx) => ({ name: entry.name, value: `${entry.wagered.toLocaleString()} wagered`, prize: prizes[idx] ? `${prizes[idx].toLocaleString()} C` : undefined })) : prizes.slice(0, 3).map((prize) => ({ prize: `${prize.toLocaleString()} C` }))} valueLabel="CSGOWIN affiliate rankings" />
            <div className="overflow-x-auto rounded-xl border border-[#252B38] bg-[#121620]/80 p-4">
              <table className="w-full min-w-[600px] text-left">
                <thead className="border-b border-[#252B38] text-xs uppercase tracking-widest text-[#8B93A3]">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Player</th>
                    <th className="p-3 text-right">Wagered</th>
                    <th className="p-3 text-right">Prize</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length > 0 ? (
                    leaderboard.map((entry, idx) => (
                      <tr key={entry.rank} className="border-b border-[#252B38]/70 text-[#F5F7FA] hover:bg-[#8B5CF6]/10">
                        <td className="p-3 font-bold text-[#A78BFA]">#{entry.rank}</td>
                        <td className="p-3 font-semibold">{entry.name}</td>
                        <td className="p-3 text-right font-semibold">{entry.wagered.toLocaleString()}</td>
                        <td className="p-3 text-right font-bold text-[#A78BFA]">{prizes[idx] ? `${prizes[idx].toLocaleString()} C` : "—"}</td>
                      </tr>
                    ))
                  ) : (
                    prizes.map((p, idx) => (
                      <tr key={idx} className="border-b border-[#252B38]/70 text-[#F5F7FA] hover:bg-[#8B5CF6]/10">
                        <td className="p-3 font-bold text-[#A78BFA]">#{idx + 1}</td>
                        <td className="p-3 font-medium text-[#8B93A3]">—</td>
                        <td className="p-3 text-right font-semibold">0</td>
                        <td className="p-3 text-right font-bold text-[#A78BFA]">{p.toLocaleString()} C</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CSGOLeadPage;


