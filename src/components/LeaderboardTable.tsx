import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";

type LeaderboardPeriod = "monthly";

interface LeaderboardPlayer {
	rank: number;
	username: string;
	wager: number;
	isFeatured?: boolean;
}

interface LeaderboardTableProps {
	period: LeaderboardPeriod;
	data: LeaderboardPlayer[] | undefined;
}

const PRIZES: Record<LeaderboardPeriod, Record<number, number>> = {
	monthly: { 1: 600, 2: 300, 3: 175, 4: 75, 5: 50, 6: 25, 7: 25 },
};

export function LeaderboardTable({ period, data }: LeaderboardTableProps) {
	if (!data || data.length === 0) {
		return (
			<div className='py-10 text-center text-black'>
				No leaderboard data available for {period}.
			</div>
		);
	}

	return (
		<div className='overflow-hidden bg-white border rounded-lg border-lightgray'>
			<Table>
				<TableHeader className='bg-lightgray'>
					<TableRow>
						<TableHead className='w-12 text-center text-black'>Rank</TableHead>
						<TableHead className='text-black'>Player</TableHead>
						<TableHead className='text-right text-black'>Wager</TableHead>
						<TableHead className='text-right text-black'>Prize</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((player) => {
						const prize = PRIZES[period]?.[player.rank] || 0;

						return (
							<TableRow
								key={player.username}
								className={player.isFeatured ? "bg-lightgray" : ""}
							>
								<TableCell className='font-medium text-center text-black'>
									{player.rank <= 3 ? (
										<div className='flex items-center justify-center'>
											<Crown
												className={`h-4 w-4 ${
													player.rank === 1
														? "text-red"
														: player.rank === 2
														? "text-black"
														: "text-lightgray"
												}`}
											/>
										</div>
									) : (
										player.rank
									)}
								</TableCell>
								<TableCell className='flex items-center gap-2 font-medium text-black'>
									{player.username}
									{player.isFeatured && (
										<Badge variant='outline' className='text-red border-red'>
											Streamer
										</Badge>
									)}
								</TableCell>
								<TableCell className='text-right text-black'>
									${player.wager.toLocaleString()}
								</TableCell>
								<TableCell
									className={`text-right ${
										prize > 0 ? "text-red" : "text-black"
									}`}
								>
									{prize > 0 ? `$${prize}` : "-"}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
