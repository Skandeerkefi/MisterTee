import React, { useEffect } from "react";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useClashStore } from "@/store/clashStore";

const prizes = [500, 200, 100, 75, 50, 25, 20, 15, 10, 5]; // Prizes for ranks 1-10

const ClashLeaderboardPage = () => {
  const { players, loading, error, fetchLeaderboard } = useClashStore();

  useEffect(() => {
    fetchLeaderboard("2025-11-01");
  }, [fetchLeaderboard]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <GraphicalBackground />
      <Navbar />

      <main className="flex-grow container mx-auto p-4 relative z-10">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Clash Leaderboard</h1>

        {loading && <p className="text-center text-white">Loading leaderboard...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {!loading && !error && players.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-700 text-white">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-2 border border-gray-700">Rank</th>
                  <th className="p-2 border border-gray-700">Username</th>
                  <th className="p-2 border border-gray-700">Wagered (Gems)</th>
                  <th className="p-2 border border-gray-700">Deposits (Gems)</th>
                  <th className="p-2 border border-gray-700">Prize (C)</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={player.uid} className="hover:bg-gray-700">
                    <td className="p-2 border border-gray-700">{index + 1}</td>
                    <td className="p-2 border border-gray-700">{player.username}</td>
                    <td className="p-2 border border-gray-700">{player.wageredGems?.toFixed(2)}</td>
                    <td className="p-2 border border-gray-700">{player.depositsGems?.toFixed(2)}</td>
                    <td className="p-2 border border-gray-700">
                      {index < prizes.length ? prizes[index] : 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && players.length === 0 && (
          <p className="text-center text-white">No players found for this period.</p>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ClashLeaderboardPage;
