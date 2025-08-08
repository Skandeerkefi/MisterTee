import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

function BonusHuntPage() {
	const [startingAmount, setStartingAmount] = useState("");
	const [games, setGames] = useState([
		{ slot: "", spinCost: "", spins: "", winnings: "", multi: 0 },
	]);

	const addGame = () => {
		setGames([
			...games,
			{ slot: "", spinCost: "", spins: "", winnings: "", multi: 0 },
		]);
	};

	const updateGame = (index: number, field: string, value: string) => {
		const updated = [...games];
		updated[index][field] = value;

		const spinCost = parseFloat(updated[index].spinCost);
		const winnings = parseFloat(updated[index].winnings);
		const spins = parseFloat(updated[index].spins);

		if (
			!isNaN(spinCost) &&
			!isNaN(spins) &&
			!isNaN(winnings) &&
			spinCost > 0 &&
			spins > 0
		) {
			const totalCost = spinCost * spins;
			updated[index].multi = parseFloat((winnings / totalCost).toFixed(2));
		} else {
			updated[index].multi = 0;
		}

		setGames(updated);
	};

	const totalWinnings = games.reduce(
		(acc, game) => acc + parseFloat(game.winnings || "0"),
		0
	);
	const totalCost = games.reduce(
		(acc, game) =>
			acc + parseFloat(game.spinCost || "0") * parseFloat(game.spins || "0"),
		0
	);

	return (
		<div className='flex flex-col min-h-screen bg-[#191F3B] text-white'>
			<Navbar />
			<main className='container flex-grow py-8'>
				<Card className='bg-[#1E2547] text-white border border-[#EA8105]/40 p-6'>
					<CardHeader>
						<CardTitle className='text-2xl text-[#EA8105]'>
							Bonus Hunt Tracker
						</CardTitle>
					</CardHeader>

					<CardContent className='space-y-6'>
						<div>
							<Label htmlFor='startAmount' className='text-[#EA8105]'>
								Starting Balance
							</Label>
							<Input
								id='startAmount'
								type='number'
								placeholder='Enter starting amount'
								value={startingAmount}
								onChange={(e) => setStartingAmount(e.target.value)}
								className='bg-[#191F3B] border border-[#EA8105] text-white'
							/>
						</div>

						{games.map((game, index) => (
							<div
								key={index}
								className='grid grid-cols-1 md:grid-cols-6 gap-4 items-end border-t border-[#EA8105]/20 pt-4'
							>
								<div>
									<Label className='text-[#EA8105]'>Slot Name</Label>
									<Input
										placeholder='Slot name'
										value={game.slot}
										onChange={(e) => updateGame(index, "slot", e.target.value)}
										className='bg-[#191F3B] border border-[#EA8105] text-white'
									/>
								</div>
								<div>
									<Label className='text-[#EA8105]'>Spin Cost</Label>
									<Input
										placeholder='Spin cost'
										type='number'
										value={game.spinCost}
										onChange={(e) =>
											updateGame(index, "spinCost", e.target.value)
										}
										className='bg-[#191F3B] border border-[#EA8105] text-white'
									/>
								</div>
								<div>
									<Label className='text-[#EA8105]'># of Spins</Label>
									<Input
										placeholder='Spins'
										type='number'
										value={game.spins}
										onChange={(e) => updateGame(index, "spins", e.target.value)}
										className='bg-[#191F3B] border border-[#EA8105] text-white'
									/>
								</div>
								<div>
									<Label className='text-[#EA8105]'>Winnings</Label>
									<Input
										placeholder='Winnings'
										type='number'
										value={game.winnings}
										onChange={(e) =>
											updateGame(index, "winnings", e.target.value)
										}
										className='bg-[#191F3B] border border-[#EA8105] text-white'
									/>
								</div>
								<div>
									<Label className='text-[#EA8105]'>Multiplier</Label>
									<Input
										value={game.multi}
										disabled
										className='bg-[#191F3B] border border-[#38BDF8] text-white'
									/>
								</div>
							</div>
						))}

						<Button
							onClick={addGame}
							className='bg-[#EA8105] hover:bg-[#C33B52] text-white'
						>
							+ Add Game
						</Button>

						<div className='text-xl font-semibold text-right'>
							{startingAmount && !isNaN(parseFloat(startingAmount)) ? (
								totalWinnings < parseFloat(startingAmount) ? (
									<span className='text-[#AF2D03]'>
										Loss:{" "}
										{(parseFloat(startingAmount) - totalWinnings).toFixed(2)}
									</span>
								) : (
									<span className='text-[#38BDF8]'>
										Winning:{" "}
										{(totalWinnings - parseFloat(startingAmount)).toFixed(2)}
									</span>
								)
							) : (
								<span className='text-[#EA8105]'>
									Total Winnings: {totalWinnings.toFixed(2)}
								</span>
							)}
						</div>
					</CardContent>
				</Card>
			</main>
			<Footer />
		</div>
	);
}

export default BonusHuntPage;
