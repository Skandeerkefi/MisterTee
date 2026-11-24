const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const fetch = (...args) =>
	import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3000;

app.use(cors());

app.get("/api/affiliates", async (req, res) => {
	const { start_at, end_at } = req.query;

	if (!start_at || !end_at) {
		return res
			.status(400)
			.json({ error: "Missing start_at or end_at parameter" });
	}

	const url = `https://services.rainbet.com/v1/external/affiliates?start_at=${start_at}&end_at=${end_at}&key=${process.env.RAINBET_API_KEY}`;

	console.log("🔍 Fetching URL:", url);

	try {
		const response = await fetch(url);
		const content = await response.text();

		console.log("🌐 Rainbet response status:", response.status);
		console.log("📦 Rainbet response body:", content);

		if (!response.ok) {
			throw new Error(content);
		}

		res.json(JSON.parse(content));
	} catch (error) {
		console.error("❌ Error fetching affiliates data:", error.message);
		res.status(500).json({ error: "Failed to fetch affiliates data" });
	}
});

const SIXTY_API_KEY =
	process.env.SIXTY_API_KEY ||
	"sxa_live_6b-BxaLDT_Ft6zNFbSQFw09qkUlk008rikXNqX_8dOM";

const SIXTY_PRIZES = [
	{ place: 1, amount: 1000 },
	{ place: 2, amount: 425 },
	{ place: 3, amount: 275 },
	{ place: 4, amount: 125 },
	{ place: 5, amount: 75 },
	{ place: 6, amount: 50 },
	{ place: 7, amount: 25 },
	{ place: 8, amount: 25 },
];

const SIXTY_PERIOD_FROM = "2026-11-23T00:00:00.000Z";
const SIXTY_PERIOD_TO = "2026-12-23T23:59:59.999Z";

app.get("/api/leaderboard/sixty", async (req, res) => {
	const startMs = new Date(SIXTY_PERIOD_FROM).getTime();
	const endMs = new Date(SIXTY_PERIOD_TO).getTime();
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

		const totalPrizePool = SIXTY_PRIZES.reduce((s, p) => s + p.amount, 0);

		res.json({
			users,
			prizes: SIXTY_PRIZES,
			title: "$2,000 Monthly Leaderboard",
			totalPrizePool,
			frequency: "monthly",
			status: "active",
			period: {
				from: SIXTY_PERIOD_FROM,
				to: SIXTY_PERIOD_TO,
			},
		});
	} catch (error) {
		console.error("Sixty leaderboard error:", error.message);
		res.status(500).json({ error: "Failed to fetch Sixty.gg leaderboard" });
	}
});

app.listen(PORT, () => {
	console.log(`✅ Server is running at http://localhost:${PORT}`);
});
