import { useEffect, useState } from "react";
import { useCSGOLeadStore } from "@/store/csgoleadStore";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const prizeMap: Record<number, string> = {
  1: "250 C 🥇",
  2: "100 C 🥈",
  3: "50 C 🥉",
  4: "25 C",
  5: "20 C",
  6: "15 C",
  7: "10 C",
  8: "10 C",
  9: "10 C",
  10: "10 C",
};

function getCurrentWeekRangeUTC() {
  const now = new Date();
  const day = now.getUTCDay();
  const diffToSunday = -day;
  const start = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + diffToSunday
  ));
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return { startOfWeek: start, endOfWeek: end };
}

// Display special fixed week (1 Nov → 8 Nov), else normal weeks
function getDisplayWeekRange() {
  const now = dayjs.utc();
  const specialStart = dayjs.utc("2025-11-01T00:00:00Z");
  const specialEnd = dayjs.utc("2025-11-08T23:59:59Z");

  if (now.isAfter(specialStart) && now.isBefore(specialEnd)) {
    return "1 Nov → 8 Nov";
  }

  const { startOfWeek, endOfWeek } = getCurrentWeekRangeUTC();
  const s = dayjs.utc(startOfWeek).format("D MMM");
  const e = dayjs.utc(endOfWeek).format("D MMM");
  return `${s} → ${e}`;
}

const CSGOLeadPage = () => {
  const { leaderboard, loading, error, fetchLeaderboard } = useCSGOLeadStore();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    fetchLeaderboard(10, 0);
  }, [fetchLeaderboard]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = dayjs.utc();
      const nextReset = dayjs.utc("2025-11-08T23:59:59Z");
      const diff = nextReset.diff(now);

      if (diff <= 0) {
        setTimeLeft("Leaderboard Ended");
        return;
      }

      const d = dayjs.duration(diff);
      const days = Math.floor(d.asDays());
      const hours = d.hours();
      const minutes = d.minutes();
      const seconds = d.seconds();
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen text-white bg-black">
      <GraphicalBackground />
      <Navbar />

      <main className="container flex-grow p-4 mx-auto">
        <h1 className="mb-4 text-5xl font-extrabold text-center text-red-500 drop-shadow-lg">
          🔥 CSGOWin Weekly Leaderboard 🔥
        </h1>

        <p className="text-center text-gray-400 mb-2">
          Week: <span className="text-red-400">{getDisplayWeekRange()}</span>
        </p>

        <p className="text-center text-md font-semibold text-gray-300 mb-6">
          ⏳ Next Reset In: <span className="text-yellow-400 font-bold">{timeLeft}</span>
        </p>

        <div className="mt-2 text-center text-gray-400">
          <p className="text-lg font-semibold text-red-400">Total Prize Pool: 500 C 💰</p>
          <p>Use code <span className="font-bold text-white">"MisterTee"</span> to participate!</p>
        </div>

        {loading && <p className="mt-10 text-center text-gray-400">Loading...</p>}
        {error && <p className="mt-10 text-center text-red-500">{error}</p>}

        {!loading && !error && leaderboard.length > 0 && (
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full text-sm bg-gray-900 border border-red-600 shadow-xl rounded-2xl">
              <thead className="text-white bg-gradient-to-r from-red-700 to-black">
                <tr>
                  <th className="p-3 text-left uppercase">#</th>
                  <th className="p-3 text-left uppercase">Name</th>
                  <th className="p-3 text-left uppercase">Wagered</th>
                  <th className="p-3 text-left uppercase">Deposited</th>
                  <th className="p-3 text-left uppercase">Prize</th>
                </tr>
              </thead>

              <tbody>
                {leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  return (
                    <tr
                      key={index}
                      className={`transition-all ${
                        rank <= 3
                          ? "bg-red-800/60 hover:bg-red-700"
                          : rank % 2 === 0
                          ? "bg-gray-800"
                          : "bg-gray-900"
                      } hover:text-white`}
                    >
                      <td className="p-3 font-bold text-red-500">#{rank}</td>
                      <td className="p-3 font-medium">{entry.name}</td>
                      <td className="p-3 font-semibold text-red-400">
                        {entry.wagered.toLocaleString()}
                      </td>
                      <td className="p-3 font-semibold text-green-400">
                        {entry.deposited.toLocaleString()}
                      </td>
                      <td className="p-3 font-semibold text-yellow-400">
                        {prizeMap[rank] || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && leaderboard.length === 0 && (
          <p className="mt-10 text-center text-gray-500">
            No leaderboard data available for this week.
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CSGOLeadPage;
