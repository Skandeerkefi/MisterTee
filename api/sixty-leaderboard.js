const SIXTY_API_KEY =
	process.env.SIXTY_API_KEY ||
	"sxa_live_6b-BxaLDT_Ft6zNFbSQFw09qkUlk008rikXNqX_8dOM";

const PRIZES = [
	{ place: 1, amount: 1000 },
	{ place: 2, amount: 425 },
	{ place: 3, amount: 275 },
	{ place: 4, amount: 125 },
	{ place: 5, amount: 75 },
	{ place: 6, amount: 50 },
	{ place: 7, amount: 25 },
	{ place: 8, amount: 25 },
];

const PERIOD_FROM = "2026-11-23T00:00:00.000Z";
const PERIOD_TO = "2026-12-23T23:59:59.999Z";

export default async function handler(req, res) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const startMs = new Date(PERIOD_FROM).getTime();
	const endMs = new Date(PERIOD_TO).getTime();
	const limit = 50;

	const url = `https://api.sixty.gg/api/v1/affiliate-api/leaderboard?timePeriod=customRange&startDate=${startMs}&endDate=${endMs}&limit=${limit}`;

	try {
		const response = await fetch(url, {
			headers: {
				"x-access-token": SIXTY_API_KEY,
				Accept: "application/json",
			},
		});

		if (!response.ok) {
			const text = await response.text();
			console.error("Sixty API error:", response.status, text);
			return res
				.status(response.status)
				.json({ error: text || "Sixty API error" });
		}

		const raw = await response.json();

		const rows = raw?.data?.rows ?? [];

		const users = rows.map((entry, idx) => ({
			id: null,
			userId: null,
			username: entry.user_name || `Player ${idx + 1}`,
			avatar: null,
			wager: Number(entry.total_wagered_amount ?? 0),
			rank: entry.rank ?? idx + 1,
		}));

		const totalPrizePool = PRIZES.reduce((s, p) => s + p.amount, 0);

		res.status(200).json({
			users,
			prizes: PRIZES,
			title: "$2,000 Monthly Leaderboard",
			totalPrizePool,
			frequency: "monthly",
			status: "active",
			period: {
				from: PERIOD_FROM,
				to: PERIOD_TO,
			},
		});
	} catch (error) {
		console.error("Sixty leaderboard fetch error:", error);
		res.status(500).json({ error: "Failed to fetch Sixty.gg leaderboard" });
	}
}
