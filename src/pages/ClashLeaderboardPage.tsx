import React, { useEffect, useState } from "react";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useClashStore } from "@/store/clashStore";

const prizes = [500, 200, 100, 75, 50, 25, 20, 15, 10, 5]; // Prizes for ranks 1-10

const ClashLeaderboardPage = () => {
  const { players, loading, error, fetchLeaderboard } = useClashStore();
  const [periodStart, setPeriodStart] = useState<Date | null>(null);
  const [periodEnd, setPeriodEnd] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<string>("");

  // Calculate current 14-day period
  const calculatePeriod = () => {
    const baseDate = new Date("2025-12-07");
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    const intervals = Math.floor(diffDays / 14);
    const start = new Date(baseDate.getTime() + intervals * 14 * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 15 * 24 * 60 * 60 * 1000 - 1000); // minus 1 sec to avoid overlap
    setPeriodStart(start);
    setPeriodEnd(end);
    return start;
  };

  useEffect(() => {
    const startDate = calculatePeriod();
    fetchLeaderboard(); // fetchLeaderboard now calculates date internally
  }, [fetchLeaderboard]);

  // Countdown timer
  useEffect(() => {
    if (!periodEnd) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = periodEnd.getTime() - now;
      if (distance <= 0) {
        setCountdown("Leaderboard period ended");
        clearInterval(timer);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [periodEnd]);

  const formatDate = (date: Date | null) => date?.toISOString().split("T")[0] || "";

  return (
    <div className="relative min-h-screen flex flex-col">
      <GraphicalBackground />
      <Navbar />

      <main className="flex-grow container mx-auto p-4 relative z-10">
        <h1 className="text-3xl font-bold mb-2 text-center text-white">
          Clash Leaderboard
        </h1>

        {periodStart && periodEnd && (
          <p className="text-center text-white mb-4">
            Period: {formatDate(periodStart)} → {formatDate(periodEnd)} | Next update in: {countdown}
          </p>
        )}

        {/* Loading state */}
        {loading && <p className="text-center text-white">Loading leaderboard...</p>}

        {/* Error state */}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {/* Leaderboard table */}
        {!loading && !error && players.length > 0 && (
          <div className="overflow-x-auto">
  <table className="w-full text-left border-separate border-spacing-0 text-white shadow-xl rounded-xl overflow-hidden backdrop-blur-xl bg-white/5">
    <thead>
      <tr className="bg-gradient-to-r from-red-700 to-red-900 text-white">
        <th className="p-3 border-b border-red-600 font-semibold text-center">Rank</th>
        <th className="p-3 border-b border-red-600 font-semibold">Username</th>
        <th className="p-3 border-b border-red-600 font-semibold text-center">Wagered (Gems)</th>
        <th className="p-3 border-b border-red-600 font-semibold text-center">Prize (Gems)</th>
      </tr>
    </thead>

    <tbody>
      {players.map((player, index) => (
        <tr
          key={player.uid}
          className={`transition duration-200 hover:bg-red-900/40 ${
            index % 2 === 0 ? "bg-white/5" : "bg-white/10"
          }`}
        >
          <td className="p-3 border-b border-gray-700 text-center font-semibold text-red-400">
            #{index + 1}
          </td>

          <td className="p-3 border-b border-gray-700 font-medium">
            {player.name}
          </td>

          <td className="p-3 border-b border-gray-700 text-center font-mono">
            {(player.wageredGems || 0).toFixed(2)}
          </td>

          <td className="p-3 border-b border-gray-700 text-center font-semibold text-yellow-300">
            {index < prizes.length ? prizes[index] : 0}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

        )}

        {/* Empty state */}
        {!loading && !error && players.length === 0 && (
          <p className="text-center text-white">No players found for this period.</p>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ClashLeaderboardPage;
