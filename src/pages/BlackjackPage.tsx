import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import GraphicalBackground from "@/components/GraphicalBackground";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { usePointsStore } from "@/store/usePointsStore";
import { getApiBaseUrl } from "@/lib/apiBase";
import {
  RefreshCw, Play, AlertTriangle,
  Volume2, VolumeX, Trophy, Sparkles, ShieldCheck,
  Coins, Heart, Diamond, Club, Spade, History,
} from "lucide-react";

// ──── Types ────
type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
  isHidden?: boolean;
}

interface Hand {
  id: string;
  cards: Card[];
  bet: number;
  status: "active" | "stand" | "bust" | "blackjack";
  isSplit?: boolean;
}

interface GameState {
  phase: "betting" | "dealing" | "playing" | "dealerTurn" | "result";
  deck: Card[];
  dealerCards: Card[];
  hands: Hand[];
  currentHandId: string | null;
  bet: number;
  resultMessage: string;
  resultType: "win" | "lose" | "push" | "blackjack" | "bust" | null;
  roundId: string | null;
}

// ──── Constants ────
const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const NUM_DECKS = 6;
const SHUFFLE_THRESHOLD = 0.75;
const BET_OPTIONS = [5, 25, 100, 500];

let cardIdCounter = 0;
const nextCardId = () => `card-${++cardIdCounter}-${Date.now()}`;

// ──── Deck / Game Logic ────
function createShoe(): Card[] {
  const cards: Card[] = [];
  for (let d = 0; d < NUM_DECKS; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        cards.push({ id: nextCardId(), suit, rank, faceUp: true });
      }
    }
  }
  return shuffle(cards);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cardValue(card: Card): number[] {
  if (card.rank === "A") return [1, 11];
  if (["J", "Q", "K"].includes(card.rank)) return [10];
  return [parseInt(card.rank)];
}

function handTotal(cards: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (!c.faceUp && c.isHidden) continue;
    if (c.rank === "A") { aces++; total += 11; }
    else if (["J", "Q", "K"].includes(c.rank)) total += 10;
    else total += parseInt(c.rank);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handTotal(cards) === 21;
}

function canSplit(hand: Hand): boolean {
  if (hand.cards.length !== 2) return false;
  const v1 = cardValue(hand.cards[0])[0];
  const v2 = cardValue(hand.cards[1])[0];
  return v1 === v2;
}

// ──── SVG Card Component ────
const CardSvg = ({ card, className = "", style = {} }: { card: Card; className?: string; style?: React.CSSProperties }) => {
  const isRed = card.suit === "hearts" || card.suit === "diamonds";
  const suitSymbol = { hearts: "\u2665", diamonds: "\u2666", clubs: "\u2663", spades: "\u2660" }[card.suit];
  const SuitIcon = { hearts: Heart, diamonds: Diamond, clubs: Club, spades: Spade }[card.suit];

  if (!card.faceUp) {
    return (
      <div
        className={`relative w-[80px] h-[112px] sm:w-[96px] sm:h-[134px] rounded-xl border-2 border-white/20 shadow-2xl flex items-center justify-center select-none ${className}`}
        style={{
          background: "linear-gradient(145deg, #1a3a8a 0%, #0d1f5e 50%, #1a3a8a 100%)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
          ...style,
        }}
      >
        <div className="absolute inset-2 rounded-lg border border-white/10" />
        <div className="grid grid-cols-3 grid-rows-4 gap-[2px] opacity-30">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
          ))}
        </div>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent to-black/30" />
      </div>
    );
  }

  return (
    <div
      className={`relative w-[80px] h-[112px] sm:w-[96px] sm:h-[134px] rounded-xl bg-white shadow-2xl flex flex-col select-none ${className}`}
      style={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.8)",
        ...style,
      }}
    >
      <div className="flex flex-col items-center pt-1.5 px-1.5">
        <span className="text-xs font-bold leading-none" style={{ color: isRed ? "#DC2626" : "#111827" }}>{card.rank}</span>
        <SuitIcon className="w-2.5 h-2.5 mt-0.5" style={{ color: isRed ? "#DC2626" : "#111827" }} />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <span className="text-3xl leading-none" style={{ color: isRed ? "#DC2626" : "#111827" }}>{suitSymbol}</span>
      </div>
      <div className="flex flex-col items-center pb-1.5 px-1.5 rotate-180">
        <span className="text-xs font-bold leading-none" style={{ color: isRed ? "#DC2626" : "#111827" }}>{card.rank}</span>
        <SuitIcon className="w-2.5 h-2.5 mt-0.5" style={{ color: isRed ? "#DC2626" : "#111827" }} />
      </div>
    </div>
  );
};

// ──── Chip Component ────
const Chip = ({ value, onClick, disabled, selected }: { value: number; onClick: () => void; disabled?: boolean; selected?: boolean }) => {
  const colors: Record<number, { bg: string; border: string; text: string }> = {
    5: { bg: "bg-red-600", border: "border-red-400", text: "text-white" },
    25: { bg: "bg-green-600", border: "border-green-400", text: "text-white" },
    100: { bg: "bg-gray-900", border: "border-gray-600", text: "text-white" },
    500: { bg: "bg-purple-600", border: "border-purple-400", text: "text-white" },
  };
  const c = colors[value] || colors[5];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 ${c.border} ${c.bg}
        flex items-center justify-center transition-all duration-150
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:scale-110 active:scale-95"}
        ${selected ? "ring-2 ring-yellow-400 scale-110" : ""}
        shadow-lg`}
      style={{ boxShadow: selected ? "0 0 20px rgba(250,204,21,0.5)" : "0 4px 12px rgba(0,0,0,0.4)" }}
    >
      <div className={`absolute inset-1.5 rounded-full border-2 border-dashed border-white/20`} />
      <span className={`font-black text-xs sm:text-sm ${c.text} drop-shadow`}>{value}</span>
    </button>
  );
};

// ──── Confetti ────
const Confetti = () => {
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1.5,
    color: ["#FFD700", "#FF6B6B", "#4ECDC4", "#A78BFA", "#34D399", "#FBBF24"][Math.floor(Math.random() * 6)],
    size: 4 + Math.random() * 6,
    rotation: Math.random() * 360,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.left}%`, top: "-10px",
            width: `${p.size}px`, height: `${p.size * 1.5}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
};

// ──── Main Page Component ────
export default function BlackjackPage() {
  const { user } = useAuthStore();
  const { profile, fetchProfile } = usePointsStore();
  const token = localStorage.getItem("token");

  const [game, setGame] = useState<GameState>({
    phase: "betting", deck: [], dealerCards: [], hands: [],
    currentHandId: null, bet: 0, resultMessage: "",
    resultType: null, roundId: null,
  });
  const [currentBet, setCurrentBet] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [animatingCards, setAnimatingCards] = useState<Map<string, boolean>>(new Map());
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastResult, setLastResult] = useState<{ type: string; msg: string; pts: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [gameConfig, setGameConfig] = useState<any>(null);
  const animTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const balance = profile?.balance ?? user?.pointsBalance ?? 0;
  const minBet = gameConfig?.minWager ?? 5;
  const maxBetLimit = gameConfig?.maxWager ?? 10000;

  const loadConfig = async () => {
    if (!token) return;
    try {
      const r = await fetch(`${getApiBaseUrl()}/api/games/config/blackjack`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setGameConfig(await r.json());
    } catch { /* offline */ }
  };
  const loadHistory = async () => {
    if (!token) return;
    try {
      const r = await fetch(`${getApiBaseUrl()}/api/games/history?gameType=blackjack&limit=12`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const d = await r.json(); setHistory(d.games || []); }
    } catch { /* ignore */ }
  };
  useEffect(() => { loadConfig(); loadHistory(); fetchProfile(); }, []);

  // Cleanup
  useEffect(() => { return () => { animTimeouts.current.forEach(clearTimeout); }; }, []);

  // Keep a live ref so async callbacks (timeouts) always read the freshest state
  const gameRef = useRef(game);
  useEffect(() => { gameRef.current = game; }, [game]);

  // ──── Deck management ────
  const ensureDeck = (): Card[] => {
    if (game.deck.length === 0) return createShoe();
    const depletion = 1 - game.deck.length / (NUM_DECKS * 52);
    if (depletion < SHUFFLE_THRESHOLD) return createShoe();
    return game.deck;
  };

  // ──── Start round ────
  const startRound = async () => {
    if (!token) { alert("Please log in to play."); return; }
    if (currentBet < minBet) { setError(`Minimum bet is ${minBet} pts`); return; }
    if (currentBet > balance) { setError("Insufficient points!"); return; }
    if (isSubmitting) return;
    setIsSubmitting(true); setError(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/games/blackjack/bet`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ wager: currentBet }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place bet");

      const shoe = ensureDeck();
      const dCard0 = shoe.pop()!;
      const dCard1 = { ...shoe.pop()!, faceUp: false, isHidden: true };
      const pCard1 = shoe.pop()!;
      const pCard2 = shoe.pop()!;

      setGame({
        phase: "dealing", deck: shoe,
        dealerCards: [dCard0, dCard1],
        hands: [{ id: "hand-0", cards: [pCard1, pCard2], bet: currentBet, status: "active" }],
        currentHandId: "hand-0", bet: currentBet,
        resultMessage: "", resultType: null,
        roundId: data.roundId || null,
      });
      setShowConfetti(false);
      setAnimatingCards(new Map()); setLastResult(null);

      const allCards = [pCard1, pCard2, dCard0, dCard1];
      allCards.forEach((card, i) => {
        const t = setTimeout(() => {
          setAnimatingCards((prev) => new Map(prev).set(card.id, true));
          setTimeout(() => { setAnimatingCards((prev) => { const m = new Map(prev); m.delete(card.id); return m; }); }, 200);
        }, 250 * (i + 1));
        animTimeouts.current.push(t);
      });

            const playingTimeout = setTimeout(() => {
        setGame((prev) => ({ ...prev, phase: "playing" }));
      }, 250 * (allCards.length + 1) + 200);
      animTimeouts.current.push(playingTimeout);

    } catch (err: any) {
      setError(err.message || "Failed to start round");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ──── Resolve round server-side ────
  const resolveRound = async (fcards?: Card[], fhands?: Hand[]) => {
    const g = gameRef.current;
    if (!g.roundId) return;
    const hands = fhands?.length ? fhands : g.hands;
    const playerHand = hands.find((h) => h.id === g.currentHandId) ?? hands[0];
    const playerTotal = handTotal(playerHand.cards);
    const dealerCards = fcards?.length ? fcards : g.dealerCards;
    const dealerTotal = handTotal(dealerCards);
    const playerBJ = isBlackjack(playerHand.cards);
    const dealerBJ = isBlackjack(g.dealerCards);

    let multiplier = 0;
    let outcome = "lose";
    let message = "Dealer Wins";

    if (playerBJ && !dealerBJ) { multiplier = 2.2; outcome = "blackjack"; message = "Blackjack!"; }
    else if (playerBJ && dealerBJ) { multiplier = 1; outcome = "push"; message = "Push – Both Blackjack"; }
    else if (dealerBJ) { multiplier = 0; outcome = "lose"; message = "Dealer Blackjack"; }
    else if (playerTotal > 21) { multiplier = 0; outcome = "lose"; message = "Bust!"; }
    else if (dealerTotal > 21) { multiplier = 2; outcome = "win"; message = "Dealer Busts – You Win!"; }
    else if (playerTotal > dealerTotal) { multiplier = 2; outcome = "win"; message = "You Win!"; }
    else if (playerTotal < dealerTotal) { multiplier = 0; outcome = "lose"; message = "Dealer Wins"; }
    else { multiplier = 1; outcome = "push"; message = "Push"; }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/games/blackjack/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ roundId: g.roundId, outcome, multiplier, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Resolution failed");

      const ptsWon = Math.max(0, data.payout - g.bet);
      setGame((prev) => ({ ...prev, phase: "result", resultMessage: message, resultType: outcome as any }));
      setLastResult({ type: outcome, msg: message, pts: ptsWon });
      if (outcome === "blackjack") { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); }
      // Immediately apply the server-reported balance so the UI updates even if fetchProfile fails
      usePointsStore.setState((s) => ({ profile: s.profile ? { ...s.profile, balance: data.balance } : null }));
      fetchProfile(); // fire-and-forget backup sync
    } catch (err: any) {
      setError(err.message || "Failed to resolve round");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ──── Hit ────
  const hit = () => {
    if (game.phase !== "playing" || !game.currentHandId) return;
    const shoe = [...game.deck];
    const newCard = shoe.pop()!;
    setGame((prev) => ({
      ...prev, deck: shoe,
      hands: prev.hands.map((h) => h.id === prev.currentHandId ? { ...h, cards: [...h.cards, newCard] } : h),
    }));
    setAnimatingCards((prev) => new Map(prev).set(newCard.id, true));
    setTimeout(() => { setAnimatingCards((prev) => { const m = new Map(prev); m.delete(newCard.id); return m; }); }, 200);

    const updatedHand = game.hands.find((h) => h.id === game.currentHandId)!;
    const total = handTotal([...updatedHand.cards, newCard]);
    if (total > 21) {
      setGame((prev) => ({
        ...prev,
        hands: prev.hands.map((h) => h.id === game.currentHandId ? { ...h, status: "bust" as const } : h),
      }));
      setTimeout(() => advanceToDealer(), 500);
    } else if (total === 21) {
      setTimeout(() => stand(), 400);
    }
  };

  // ──── Stand ────
  const stand = () => {
    if (game.phase !== "playing" || !game.currentHandId) return;
    setGame((prev) => ({
      ...prev,
      hands: prev.hands.map((h) => h.id === prev.currentHandId ? { ...h, status: "stand" as const } : h),
    }));
    setTimeout(() => advanceToDealer(), 400);
  };

  // ──── Double Down ────
  const doubleDown = async () => {
    if (game.phase !== "playing" || !game.currentHandId) return;
    const hand = game.hands.find((h) => h.id === game.currentHandId)!;
    if (hand.cards.length !== 2) return;
    if (hand.bet * 2 > balance) { setError("Insufficient points to double"); return; }
    setIsSubmitting(true);
    try {
      const shoe = [...game.deck];
      const newCard = shoe.pop()!;
      const updatedHand: Hand = { ...hand, cards: [...hand.cards, newCard], bet: hand.bet * 2 };
      const total = handTotal(updatedHand.cards);
      setGame((prev) => ({
        ...prev, deck: shoe,
        hands: prev.hands.map((h) => h.id === game.currentHandId ? updatedHand : h),
      }));
      setAnimatingCards((prev) => new Map(prev).set(newCard.id, true));
      setTimeout(() => { setAnimatingCards((prev) => { const m = new Map(prev); m.delete(newCard.id); return m; }); }, 200);
      const newStatus = total > 21 ? "bust" : "stand";
      setGame((prev) => ({
        ...prev,
        hands: prev.hands.map((h) => h.id === game.currentHandId ? { ...h, status: newStatus as any } : h),
      }));
      setTimeout(() => advanceToDealer(), 600);
    } catch (err: any) { setError(err.message); } finally { setIsSubmitting(false); }
  };

  // ──── Split ────
  const split = () => {
    if (game.phase !== "playing" || !game.currentHandId) return;
    const hand = game.hands.find((h) => h.id === game.currentHandId)!;
    if (!canSplit(hand)) return;
    if (game.hands.length >= 4) { setError("Max 4 hands reached"); return; }
    const shoe = [...game.deck];
    const extra1 = shoe.pop()!;
    const extra2 = shoe.pop()!;
    const h1: Hand = { id: `${hand.id}-a`, cards: [hand.cards[0], extra1], bet: hand.bet, status: "active" };
    const h2: Hand = { id: `${hand.id}-b`, cards: [hand.cards[1], extra2], bet: hand.bet, status: "active", isSplit: true };
    setGame((prev) => ({
      ...prev, deck: shoe,
      hands: prev.hands.filter((h) => h.id !== prev.currentHandId).concat([h1, h2]),
      currentHandId: h1.id,
    }));
    [extra1, extra2].forEach((c, i) => {
      const t = setTimeout(() => {
        setAnimatingCards((prev) => new Map(prev).set(c.id, true));
        setTimeout(() => { setAnimatingCards((prev) => { const m = new Map(prev); m.delete(c.id); return m; }); }, 200);
      }, 150 * (i + 1));
      animTimeouts.current.push(t);
    });
  };


  // ──── Advance to dealer ────
  const advanceToDealer = () => {
    const g = gameRef.current;
    const allDone = g.hands.every((h) => h.status !== "active");
    if (!allDone) {
      const next = g.hands.find((h) => h.status === "active");
      if (next) { setGame((prev) => ({ ...prev, currentHandId: next.id })); return; }
    }
    // Reveal dealer hole card
    setGame((prev) => ({
      ...prev,
      dealerCards: prev.dealerCards.map((c, i) => i === 1 ? { ...c, faceUp: true } : c),
      phase: "dealerTurn",
    }));
    const drawNextCard = () => {
      const t = setTimeout(() => {
        setGame((prev) => {
          const total = handTotal(prev.dealerCards);
          if (total < 17) {
            const shoe = [...prev.deck];
            const card = shoe.pop()!;
            const newDealerCards = [...prev.dealerCards, card];
            const newTotal = handTotal(newDealerCards);
            if (newTotal < 17) {
              // Dealer needs another card — schedule next draw
              const t2 = setTimeout(drawNextCard, 500);
              animTimeouts.current.push(t2);
            } else {
              // Dealer stands — resolve with the final confirmed cards
              resolveAllHands(newDealerCards);
            }
            return { ...prev, deck: shoe, dealerCards: newDealerCards };
          }
          // Dealer already ≥ 17 — resolve immediately
          resolveAllHands(prev.dealerCards);
          return prev;
        });
      }, 500);
      animTimeouts.current.push(t);
    };
    const t0 = setTimeout(drawNextCard, 600);
    animTimeouts.current.push(t0);
  };

  // ──── Resolve all hands ────
  const resolveAllHands = (dcards: Card[] = [], hnds: Hand[] = []) => {
    const g = gameRef.current;
    const dealerCards = dcards.length ? dcards : g.dealerCards;
    const hands = hnds.length ? hnds : g.hands;
    const dealerTotal = handTotal(dealerCards);
    const dealerBJ = isBlackjack(dealerCards);
    const firstHandBJ = isBlackjack(hands[0]?.cards ?? []);
    let messages: string[] = [];
    let types: string[] = [];
    hands.forEach((hand) => {
      const pt = handTotal(hand.cards);
      if (pt > 21) { messages.push("Bust!"); types.push("lose"); }
      else if (dealerBJ && !firstHandBJ) { messages.push("Dealer Blackjack"); types.push("lose"); }
      else if (isBlackjack(hand.cards) && !dealerBJ) { messages.push("Blackjack!"); types.push("blackjack"); }
      else if (pt > dealerTotal) { messages.push("Wins!"); types.push("win"); }
      else if (pt < dealerTotal) { messages.push("Loses"); types.push("lose"); }
      else { messages.push("Push"); types.push("push"); }
    });
    const primaryType = types.find((t) => t !== "lose") || "lose";
    setGame((prev) => ({ ...prev, phase: "result", resultMessage: messages[0] || "Round over", resultType: primaryType as any }));
    if (primaryType === "blackjack") { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); }
    resolveRound(dealerCards, hands);
  };

  // ──── Clear / Rebet ────
  const clearBet = () => { setCurrentBet(0); setError(null); };
  const rebet = () => {
    if (lastResult) {
      const amount = lastResult.pts > 0 ? lastResult.pts : game.bet;
      if (amount >= minBet && amount <= balance) setCurrentBet(amount);
    }
  };

  // ──── Derived state ────
  const playerTotal = game.hands[0] ? handTotal(game.hands[0].cards) : 0;
  const dealerTotalFull = game.dealerCards.every((c) => c.faceUp) ? handTotal(game.dealerCards) : null;
  const canHit = game.phase === "playing" && game.hands.some((h) => h.status === "active");
  const canStand = canHit;
  const canDouble = game.phase === "playing" && game.hands.some((h) => h.status === "active" && h.cards.length === 2 && h.bet * 2 <= balance);
  const canSplitAction = game.phase === "playing" && game.hands.some((h) => h.status === "active" && canSplit(h));

  const resultGlowClass = game.resultType === "win" || game.resultType === "blackjack" ? "text-emerald-400"
    : game.resultType === "lose" || game.resultType === "bust" ? "text-red-400"
    : game.resultType === "push" ? "text-yellow-400" : "text-white";

  const tableGlow = game.resultType === "win" || game.resultType === "blackjack" ? "shadow-[0_0_60px_rgba(52,211,153,0.3)]"
    : game.resultType === "lose" || game.resultType === "bust" ? "shadow-[0_0_40px_rgba(239,68,68,0.2)]" : "";

  // ──── JSX ────
  return (
    <div className="relative flex flex-col min-h-screen text-white overflow-hidden">
      <GraphicalBackground />
      <Navbar />
      {showConfetti && <Confetti />}

      {/* Custom keyframe animations */}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-fall { animation: confetti-fall linear forwards; }
        @keyframes card-deal {
          0% { transform: translate(300px, -200px) rotate(15deg); opacity: 0; }
          100% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
        }
        .card-deal-anim { animation: card-deal 0.3s ease-out forwards; }
        @keyframes slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .slide-up-anim { animation: slide-up 0.4s ease-out; }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(52,211,153,0.3); }
          50% { box-shadow: 0 0 40px rgba(52,211,153,0.6); }
        }
        .win-glow { animation: pulse-glow 1.5s ease-in-out infinite; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .bust-shake { animation: shake 0.3s ease-in-out; }
      `}</style>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-4">
          <div>
            <p className="section-kicker">Points arcade</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Spade className="w-6 h-6 text-[#A78BFA]" /> Blackjack
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="surface-panel px-4 py-2 flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-[#8B93A3]">Balance:</span>
              <span className="font-bold text-[#A78BFA]">{balance.toLocaleString()} pts</span>
            </div>
            <button onClick={() => setSoundOn(!soundOn)} className="surface-panel p-2 rounded-lg hover:bg-[#181D27] transition-colors" title={soundOn ? "Mute" : "Unmute"}>
              {soundOn ? <Volume2 className="w-4 h-4 text-[#A78BFA]" /> : <VolumeX className="w-4 h-4 text-[#5F6878]" />}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="w-full max-w-4xl mb-3 surface-panel border border-red-500/50 px-4 py-3 flex items-center gap-2 text-red-400 text-sm slide-up-anim">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">\u00d7</button>
          </div>
        )}

        {/* ──── GAME TABLE ──── */}
        <div className={`w-full max-w-4xl surface-panel rounded-2xl p-4 sm:p-6 ${tableGlow} transition-all duration-300`}
          style={{ background: "radial-gradient(ellipse at 50% 40%, #1a5c2a 0%, #0d3d1a 50%, #071f0e 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.5)" }}>

          {/* Dealer area */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-green-300/60">
                Dealer{dealerTotalFull !== null && ` \u00b7 ${dealerTotalFull}`}
              </span>
              {dealerTotalFull !== null && dealerTotalFull > 21 && (
                <span className="text-xs font-bold text-red-400 animate-pulse">BUST!</span>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 min-h-[134px]">
              {game.dealerCards.length === 0 ? (
                <div className="w-[80px] h-[112px] sm:w-[96px] sm:h-[134px] rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center">
                  <span className="text-white/10 text-2xl">\u2660</span>
                </div>
              ) : game.dealerCards.map((card) => (
                <div key={card.id} className={`transition-all duration-200 ${animatingCards.get(card.id) ? "card-deal-anim" : ""}`}>
                  <CardSvg card={card} />
                </div>
              ))}
            </div>
          </div>

          {/* Result banner */}
          {game.phase === "result" && (
            <div className={`mb-4 text-center py-3 rounded-xl slide-up-anim ${
              game.resultType === "win" || game.resultType === "blackjack" ? "bg-emerald-500/15 border border-emerald-500/30"
              : game.resultType === "lose" || game.resultType === "bust" ? "bg-red-500/10 border border-red-500/20"
              : "bg-yellow-500/10 border border-yellow-500/20"
            }`}>
              <p className={`text-2xl sm:text-3xl font-black font-display ${resultGlowClass} flex items-center justify-center gap-2`}>
                {game.resultType === "blackjack" && <Sparkles className="w-6 h-6 text-yellow-400" />}
                {game.resultType === "win" && <Trophy className="w-5 h-5 text-emerald-400" />}
                {game.resultMessage}
              </p>
            </div>
          )}

          {/* Player hands */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-green-300/60">
                Your Hand{playerTotal > 0 && ` \u00b7 ${playerTotal}`}
              </span>
              {playerTotal > 21 && <span className="text-xs font-bold text-red-400 animate-pulse">BUST!</span>}
              {game.hands.length > 1 && <span className="text-xs text-green-300/50">{game.hands.length} hands</span>}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 min-h-[134px]">
              {game.hands.map((hand) => {
                const isActive = hand.id === game.currentHandId && game.phase === "playing";
                const ht = handTotal(hand.cards);
                return (
                  <div key={hand.id} className={`flex flex-col items-center gap-2 transition-all duration-200 ${hand.status === "bust" ? "bust-shake opacity-70" : ""} ${hand.status === "blackjack" ? "win-glow rounded-xl" : ""} ${isActive ? "scale-105" : ""}`} style={isActive ? { boxShadow: "0 0 25px rgba(139,92,246,0.5)" } : {}}>
                    <div className="flex items-center gap-1 bg-black/40 rounded-full px-3 py-1 text-xs font-bold text-yellow-400">
                      <Coins className="w-3 h-3" />{hand.bet}
                    </div>
                    <div className="flex -space-x-6">
                      {hand.cards.map((card) => (
                        <div key={card.id} className={`transition-all duration-200 ${animatingCards.get(card.id) ? "card-deal-anim" : ""}`}>
                          <CardSvg card={card} />
                        </div>
                      ))}
                    </div>
                    <div className={`text-sm font-bold px-3 py-1 rounded-full ${ht > 21 ? "bg-red-500/30 text-red-400" : ht === 21 && hand.cards.length === 2 ? "bg-yellow-500/30 text-yellow-300" : isActive ? "bg-purple-500/30 text-purple-300" : "bg-white/10 text-white/60"}`}>
                      {ht}
                      {isBlackjack(hand.cards) && " BJ!"}
                    </div>
                    {isActive && game.phase === "playing" && <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />}
                  </div>
                );
              })}
              {game.hands.length === 0 && (
                <div className="w-[80px] h-[112px] sm:w-[96px] sm:h-[134px] rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center">
                  <span className="text-white/10 text-2xl">\u2665</span>
                </div>
              )}
            </div>
          </div>
          {/* ──── BETTING AREA ──── */}
          {game.phase === "betting" && (
            <div className="border-t border-white/10 pt-5 slide-up-anim">
              <p className="text-center text-sm text-green-200/60 mb-4">Place your bet to begin</p>
              <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
                {BET_OPTIONS.map((val) => (
                  <Chip key={val} value={val} onClick={() => setCurrentBet(currentBet + val)} disabled={currentBet + val > balance} />
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="surface-panel px-6 py-3 flex items-center gap-3">
                  <span className="text-sm text-[#8B93A3]">Current Bet:</span>
                  <span className="text-2xl font-black text-yellow-400">{currentBet.toLocaleString()}</span>
                  <span className="text-sm text-[#8B93A3]">pts</span>
                </div>
                {currentBet > 0 && (
                  <Button variant="outline" onClick={clearBet} className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm">Clear</Button>
                )}
              </div>
              <div className="flex justify-center gap-3">
                <Button onClick={startRound} disabled={currentBet < minBet || isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold px-12 py-4 text-lg rounded-xl transition-all duration-200 hover:shadow-glow-md active:scale-95">
                  <Play className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Dealing..." : "Deal"}
                </Button>
              </div>
              {currentBet > 0 && currentBet > balance && (
                <p className="text-center text-red-400 text-xs mt-2">Not enough points for this bet</p>
              )}
            </div>
          )}

          {/* ──── ACTION BUTTONS ──── */}
          {(game.phase === "playing") && (
            <div className="border-t border-white/10 pt-5 slide-up-anim">
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={hit} disabled={!canHit || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold px-8 py-3 rounded-xl transition-all duration-150 active:scale-95">Hit</Button>
                <Button onClick={stand} disabled={!canStand || isSubmitting}
                  className="bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold px-8 py-3 rounded-xl transition-all duration-150 active:scale-95">Stand</Button>
                <Button onClick={doubleDown} disabled={!canDouble || isSubmitting}
                  className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold px-8 py-3 rounded-xl transition-all duration-150 active:scale-95">Double</Button>
                <Button onClick={split} disabled={!canSplitAction || isSubmitting}
                  className="bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold px-8 py-3 rounded-xl transition-all duration-150 active:scale-95">Split</Button>
              </div>
              <div className="text-center mt-3">
                <span className="text-xs text-green-200/40">
                  {game.hands.find((h) => h.id === game.currentHandId)?.status === "active" ? "Your turn" : "Waiting..."}
                </span>
              </div>
            </div>
          )}

          {/* ──── DEALER TURN ──── */}
          {game.phase === "dealerTurn" && (
            <div className="border-t border-white/10 pt-4 text-center">
              <p className="text-sm text-green-200/60 animate-pulse">Dealer is drawing...</p>
            </div>
          )}

          {/* ──── RESULT ACTIONS ──── */}
          {game.phase === "result" && (
            <div className="border-t border-white/10 pt-5 slide-up-anim">
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={() => {
                  setGame({ phase: "betting", deck: game.deck, dealerCards: [], hands: [], currentHandId: null, bet: 0, resultMessage: "", resultType: null, roundId: null });
                  setError(null);
                }} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-10 py-3 rounded-xl transition-all duration-150 active:scale-95">
                  <Play className="w-4 h-4 mr-2" /> New Hand
                </Button>
                {lastResult && (
                  <Button onClick={rebet} disabled={isSubmitting} variant="outline"
                    className="border-purple-500/40 text-purple-300 hover:bg-purple-500/10 disabled:bg-transparent disabled:text-gray-600 px-6 py-3 rounded-xl">
                    <RefreshCw className="w-4 h-4 mr-2" /> Rebet
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rules */}
        <div className="w-full max-w-4xl mt-4 surface-panel p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#A78BFA] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[#F5F7FA] mb-1">Blackjack Rules</p>
              <p className="text-xs text-[#8B93A3] leading-relaxed">
                6-deck shoe \u00b7 Dealer stands on 17 (including soft 17) \u00b7 Blackjack pays 6:5 \u00b7
                Double down on any two cards \u00b7 Split up to 3 hands.
                Bets are deducted from your points balance and payouts are processed server-side.
              </p>
            </div>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="w-full max-w-4xl mt-4 surface-panel p-4">
            <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-sm font-bold text-[#A78BFA] hover:text-white transition-colors w-full">
              <History className="w-4 h-4" /> Recent Rounds
              <span className="text-[#5F6878] text-xs ml-auto">{showHistory ? "\u25b2" : "\u25bc"}</span>
            </button>
            {showHistory && (
              <div className="mt-3 space-y-1">
                {history.slice(0, 8).map((h) => (
                  <div key={h._id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-black/20">
                    <span className={`px-2 py-0.5 rounded font-bold ${h.outcome === "win" || h.outcome === "blackjack" ? "bg-emerald-500/20 text-emerald-400" : h.outcome === "lose" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {h.outcome.toUpperCase()}
                    </span>
                    <span className="text-[#8B93A3]">Bet: {h.wager.toLocaleString()}</span>
                    <span className={h.payout > 0 ? "text-emerald-400" : "text-[#5F6878]"}>
                      {h.payout > 0 ? `+${h.payout.toLocaleString()}` : "0"}
                    </span>
                    <span className="text-[#5F6878] ml-auto">{new Date(h.playedAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
