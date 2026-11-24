import { useEffect, useMemo, useState } from "react";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import LeaderboardPodium from "@/components/LeaderboardPodium";
import { useSixtyLeaderboardStore } from "@/store/sixtyLeaderboardStore";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";

dayjs.extend(duration);
dayjs.extend(utc);

const SIXTY_LOGO = "https://prod-cdn.sixty.gg/tig/assets/png/sixty-logo.png";

const FALLBACK_PRIZES: Record<number, number> = {
  1: 1000,
  2: 425,
  3: 275,
  4: 125,
  5: 75,
  6: 50,
  7: 25,
  8: 25,
};

const PERKS = [
  { label: "50% Deposit Bonus", color: "#00D4AA" },
  { label: "20% Rakeback", color: "#00D4AA" },
  { label: "Wager Promotion", color: "#00D4AA" },
  { label: "VIP Transfer", color: "#00D4AA" },
];

function formatWager(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function SixtyLeaderboardPage() {
  const { users, prizes, meta, period, loading, error, fetchLeaderboard } =
    useSixtyLeaderboardStore();
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const rankPrizes = useMemo(() => {
    const out: Record<number, number> = {};
    for (let rank = 1; rank <= 8; rank += 1) {
      const fromApi = prizes.find((p) => p.place === rank)?.amount;
      out[rank] = fromApi ?? FALLBACK_PRIZES[rank] ?? 0;
    }
    return out;
  }, [prizes]);

  const totalPrizePool = useMemo(
    () =>
      meta.totalPrizePool > 0
        ? meta.totalPrizePool
        : Object.values(rankPrizes).reduce((s, v) => s + v, 0),
    [meta.totalPrizePool, rankPrizes]
  );

  const displayRange = useMemo(() => {
    const s = period?.from || "2026-11-23";
    const e = period?.to || "2026-12-23";
    return {
      start: dayjs.utc(s).format("MMM D, YYYY"),
      end: dayjs.utc(e).format("MMM D, YYYY"),
    };
  }, [period?.from, period?.to]);

  const periodEnd = useMemo(
    () => (period?.to ? dayjs(period.to) : dayjs("2026-12-23T23:59:59.999Z")),
    [period?.to]
  );

  useEffect(() => {
    if (!periodEnd || !periodEnd.isValid()) {
      setCountdown("");
      return;
    }

    const tick = () => {
      const diff = periodEnd.diff(dayjs());
      if (diff <= 0) {
        setCountdown("Leaderboard period ended");
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown(`${d}d ${h}h ${m}m ${s}s remaining`);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [periodEnd]);

  return (
    <div className="relative flex flex-col min-h-screen text-white bg-black">
      <GraphicalBackground />
      <Navbar />

      <main className="container relative z-10 flex-1 max-w-6xl px-4 py-8 mx-auto">
        {/* Header with logo */}
        <div className="mb-4 flex flex-col items-center gap-3">
          <img
            src={SIXTY_LOGO}
            alt="Sixty.gg"
            className="h-14 w-auto drop-shadow-lg"
          />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-[#00D4AA] drop-shadow-lg">
            ${totalPrizePool.toLocaleString()} Monthly Leaderboard
          </h1>
        </div>

        {/* Period + countdown */}
        <p className="mb-1 text-center text-sm font-medium text-slate-400">
          Event Duration:{" "}
          <span className="font-bold text-[#00D4AA]">
            {displayRange.start} → {displayRange.end} (UTC)
          </span>
        </p>
        <p className="mb-2 text-center text-md font-semibold text-white">
          ⏳ Time Remaining:{" "}
          <span className="text-[#00D4AA] font-bold">
            {countdown || "—"}
          </span>
        </p>
        <p className="mb-6 text-center text-xs text-slate-400">
          Ranked by total wager — use code{" "}
          <a
            href="https://sixty.gg/?ref=MISTERTEE"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-white hover:text-[#00D4AA] transition-colors"
          >
            MISTERTEE
          </a>{" "}
          on Sixty.gg to compete
        </p>

        {/* Perks banner */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          {PERKS.map((perk) => (
            <span
              key={perk.label}
              className="rounded-full border border-[#00D4AA]/40 bg-[#00D4AA]/10 px-4 py-1.5 text-xs font-semibold text-[#00D4AA]"
            >
              {perk.label}
            </span>
          ))}
        </div>

        {/* Podium */}
        <LeaderboardPodium
          players={[0, 1, 2].map((index) => ({
            name: users[index]?.username,
            value: users[index]
              ? `$${formatWager(users[index].wager)} wagered`
              : undefined,
            prize: rankPrizes[index + 1]
              ? `$${rankPrizes[index + 1].toLocaleString()}`
              : undefined,
          }))}
          valueLabel="Sixty.gg wager rankings"
        />

        {/* Prize breakdown cards */}
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(rankPrizes).map(([rank, prize]) => (
            <div
              key={rank}
              className={`rounded-xl border p-4 text-center ${
                Number(rank) <= 3
                  ? "border-[#00D4AA]/50 bg-[#00D4AA]/10"
                  : "border-[#252B38] bg-gray-950/60"
              }`}
            >
              <p className="text-xs font-semibold text-slate-400 uppercase">
                {Number(rank) === 1
                  ? "1st"
                  : Number(rank) === 2
                  ? "2nd"
                  : Number(rank) === 3
                  ? "3rd"
                  : `${rank}th`}
              </p>
              <p className="text-lg font-bold text-[#00D4AA]">
                ${prize.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Loading / Error / Empty */}
        {loading && (
          <div className="flex items-center justify-center h-56">
            <Loader2 className="w-10 h-10 text-[#00D4AA] animate-spin" />
          </div>
        )}
        {error && (
          <p className="mt-10 text-center text-red-400" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && users.length === 0 && (
          <p className="mt-10 text-center text-slate-500">
            No players on the leaderboard yet — be the first to wager!
          </p>
        )}
        {!loading && !error && users.length > 0 && users.length <= 3 && (
          <p className="mt-6 text-center text-xs text-slate-500">
            Only top {users.length} so far — more players will appear as the
            period fills.
          </p>
        )}

        {/* Full table */}
        {!loading && !error && users.length > 3 && (
          <div className="mt-2 overflow-x-auto rounded-2xl border border-[#00D4AA]/30 shadow-xl bg-gray-950/80">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-white bg-gradient-to-r from-[#00D4AA]/20 to-black">
                  <th className="p-3 font-semibold uppercase">#</th>
                  <th className="p-3 font-semibold uppercase">Player</th>
                  <th className="p-3 font-semibold uppercase text-right">
                    Wager
                  </th>
                  <th className="p-3 font-semibold uppercase text-right">
                    Prize
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.slice(3).map((u, idx) => {
                  const prize = rankPrizes[u.rank] ?? 0;
                  return (
                    <tr
                      key={u.id ?? `${u.rank}-${idx}`}
                      className={
                        u.rank <= 8
                          ? "bg-[#00D4AA]/5 hover:bg-[#00D4AA]/15"
                          : idx % 2 === 0
                          ? "bg-gray-900/80 hover:bg-gray-800/90"
                          : "bg-black/40 hover:bg-gray-900/80"
                      }
                    >
                      <td className="p-3 font-bold text-[#00D4AA]">
                        #{u.rank}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt=""
                              className="object-cover w-10 h-10 rounded-full border border-[#00D4AA]/40"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-10 h-10 text-xs font-bold rounded-full bg-[#00D4AA]/20 text-[#00D4AA]">
                              ?
                            </div>
                          )}
                          <span className="font-medium text-white">
                            {u.username}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-right text-[#00D4AA]">
                        ${formatWager(u.wager)}
                      </td>
                      <td className="p-3 font-semibold text-right text-amber-300">
                        {prize > 0 ? `$${prize.toLocaleString()}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <a
            href="https://sixty.gg/?ref=MISTERTEE"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#00D4AA] px-8 py-3 text-sm font-bold text-black hover:bg-[#00B894] transition-colors shadow-lg"
          >
            <img src={SIXTY_LOGO} alt="" className="h-5 w-auto" />
            Play on Sixty.gg
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
