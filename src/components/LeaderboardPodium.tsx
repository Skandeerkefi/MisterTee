import { Crown, Trophy } from "lucide-react";

export interface PodiumPlayer {
  name?: string;
  value?: string;
  prize?: string;
}

interface LeaderboardPodiumProps {
  players: PodiumPlayer[];
  valueLabel?: string;
}

const placements = [
  { rank: 2, className: "order-2 md:order-1", size: "h-40 w-36", color: "#6F7890" },
  { rank: 1, className: "order-1 md:order-2 md:-translate-y-6", size: "h-52 w-44", color: "#A78BFA" },
  { rank: 3, className: "order-3", size: "h-40 w-36", color: "#7C6AA8" },
];

function PodiumShirt({ player, rank, color, size }: { player?: PodiumPlayer; rank: number; color: string; size: string }) {
  const name = player?.name || "Waiting";
  return <div className="flex flex-col items-center">
    <div className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#8B93A3]">{rank === 1 && <Crown className="h-3.5 w-3.5 text-[#A78BFA]" />} {rank} place</div>
    <div className={`relative ${size} transition duration-300 hover:-translate-y-2`}>
      <div className="absolute inset-4 rounded-full blur-2xl" style={{ background: rank === 1 ? "rgba(139,92,246,.24)" : "rgba(139,92,246,.08)" }} />
      <svg viewBox="0 0 120 144" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative h-full w-full drop-shadow-[0_18px_22px_rgba(0,0,0,.55)]">
        <path d="M60 9V3M60 16V28M15 26h90" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" />
        <path d="M27 38 16 64h17v61q0 5 5 5h44q5 0 5-5V64h17L93 38l-23-5q-3-10-10-10t-10 10z" fill={rank === 1 ? "#25213D" : "#171B27"} stroke={color} strokeWidth={rank === 1 ? "2" : "1.2"} />
        <path d="M50 33q3-10 10-10t10 10" fill={rank === 1 ? "#25213D" : "#171B27"} stroke={color} strokeWidth="1.2" />
        <path d="M52 34q3-6 8-6t8 6" fill="#0D1017" opacity=".85" />
        <path d="M27 38 35 46M93 38 85 46" stroke={color} strokeWidth="1.5" opacity=".7" />
        <text x="60" y="72" textAnchor="middle" fill={color} fontSize={rank === 1 ? "8" : "7"} fontWeight="700" letterSpacing=".6">{name.slice(0, 11).toUpperCase()}</text>
        <text x="60" y="91" textAnchor="middle" fill="#F5F7FA" fontSize="14" fontWeight="700">#{rank}</text>
        <path d="M47 106h26" stroke={color} strokeWidth="1" opacity=".6" />
        <circle cx="60" cy="116" r="4" fill="none" stroke={color} strokeWidth="1.2" />
      </svg>
    </div>
    <p className="mt-2 max-w-36 truncate text-center font-display text-sm font-bold text-[#F5F7FA]">{name}</p>
    {player?.value && <p className="mt-1 text-xs font-semibold text-[#A78BFA]">{player.value}</p>}
    {player?.prize && <p className="mt-1 flex items-center gap-1 text-[10px] text-[#8B93A3]"><Trophy className="h-3 w-3 text-[#A78BFA]" /> {player.prize}</p>}
  </div>;
}

export default function LeaderboardPodium({ players, valueLabel }: LeaderboardPodiumProps) {
  return <section className="surface-panel mb-8 px-3 pb-6 pt-5 sm:px-8">
    <div className="mb-5 text-center"><p className="section-kicker">The front three</p><h2 className="mt-1 font-display text-xl font-bold">Top players</h2>{valueLabel && <p className="mt-1 text-xs text-[#5F6878]">{valueLabel}</p>}</div>
    <div className="grid grid-cols-3 items-end justify-items-center gap-2 sm:gap-6">
      {placements.map((placement) => <div key={placement.rank} className={placement.className}><PodiumShirt player={players[placement.rank - 1]} rank={placement.rank} color={placement.color} size={placement.size} /></div>)}
    </div>
  </section>;
}

