import { useEffect, useState } from "react";
import { useCSGOLeadStore } from "@/store/csgoleadStore";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import dayjs from "dayjs";
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

      // fetch leaderboard again to get prizes
      const res = await fetch(`https://misterteedata-production.up.railway.app/api/leaderboard/csgowin`);
      const data = await res.json();
      const currentLB = data.leaderboards?.[0];
      if (currentLB) {
        // convert prizes to real values (remove last 2 zeros)
        const realPrizes = currentLB.prizes.map((p: number) => Math.floor(p / 100));
        setPrizes(realPrizes);
      }
    };
    fetchData();
  }, [fetchLeaderboard]);

  // Countdown to current leaderboard end
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

  // Display range formatted
  const displayRange =
    dateStart && dateEnd
      ? `${dayjs.utc(dateStart).format("D MMM")} → ${dayjs.utc(dateEnd).format("D MMM")}`
      : "";

  // Total prize pool from prizes array
  const totalPrize = prizes.reduce((acc, p) => acc + p, 0);

  return (
    <div className="relative flex flex-col min-h-screen text-white bg-black">
      <GraphicalBackground />
      <Navbar />

      <main className="container flex-grow p-4 mx-auto">
        <h1 className="mb-4 text-5xl font-extrabold text-center text-red-500 drop-shadow-lg">
          🔥 CSGOWin 1K Leaderboard 🔥
        </h1>

        <p className="text-center text-gray-400 mb-2">
          Range: <span className="text-red-400">{displayRange}</span>
        </p>

        <p className="text-center text-md font-semibold text-gray-300 mb-6">
          ⏳ Next Reset In: <span className="text-yellow-400 font-bold">{timeLeft}</span>
        </p>

        <div className="mt-2 text-center text-gray-400">
          <p className="text-lg font-semibold text-red-400">
            Total Prize Pool: {totalPrize.toLocaleString()} C 💰
          </p>
          <p>
            Use code <span className="font-bold text-white">"MisterTee"</span> to participate!
          </p>
        </div>

        {loading && <p className="mt-10 text-center text-gray-400">Loading...</p>}
        {error && <p className="mt-10 text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full text-sm bg-gray-900 border border-red-600 shadow-xl rounded-2xl">
              <thead className="text-white bg-gradient-to-r from-red-700 to-black">
                <tr>
                  <th className="p-3 text-left uppercase">#</th>
                  <th className="p-3 text-left uppercase">Name</th>
                  <th className="p-3 text-left uppercase">Wagered</th>
                  <th className="p-3 text-left uppercase">Prize</th>
                </tr>
              </thead>

              <tbody>
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, idx) => (
                    <tr
                      key={entry.rank}
                      className={`transition-all ${
                        entry.rank <= 3
                          ? "bg-red-800/60 hover:bg-red-700"
                          : entry.rank % 2 === 0
                          ? "bg-gray-800"
                          : "bg-gray-900"
                      } hover:text-white`}
                    >
                      <td className="p-3 font-bold text-red-500">#{entry.rank}</td>
                      <td className="p-3 font-medium">{entry.name}</td>
                      <td className="p-3 font-semibold text-red-400">
                        {entry.wagered.toLocaleString()}
                      </td>
                      <td className="p-3 font-semibold text-yellow-400">
                        {prizes[idx] ? prizes[idx].toLocaleString() : "—"} C
                      </td>
                    </tr>
                  ))
                ) : (
                  // Show all prizes even if no users
                  prizes.map((p, idx) => (
                    <tr
                      key={idx}
                      className={`transition-all ${
                        idx < 3
                          ? "bg-red-800/60 hover:bg-red-700"
                          : idx % 2 === 0
                          ? "bg-gray-800"
                          : "bg-gray-900"
                      } hover:text-white`}
                    >
                      <td className="p-3 font-bold text-red-500">#{idx + 1}</td>
                      <td className="p-3 font-medium">—</td>
                      <td className="p-3 font-semibold text-red-400">0</td>
                      <td className="p-3 font-semibold text-yellow-400">{p.toLocaleString()} C</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CSGOLeadPage;
