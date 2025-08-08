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

// Prize mapping for monthly leaderboard (adjust as needed)
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
		<div className='overflow-hidden border rounded-lg border-[#E0E0E0] bg-[#FFFFFF]'>
			<Table>
				<TableHeader className='bg-[#F5F5F5]'>
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
								className={player.isFeatured ? "bg-[#F5F5F5]" : ""}
							>
								<TableCell className='font-medium text-center text-black'>
									{player.rank <= 3 ? (
										<div className='flex items-center justify-center'>
											<Crown
												className={`h-4 w-4 ${
													player.rank === 1
														? "text-black"
														: player.rank === 2
														? "text-[#666666]"
														: "text-[#999999]"
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
										<Badge
											variant='outline'
											className='text-black border-black'
										>
											Streamer
										</Badge>
									)}
								</TableCell>
								<TableCell className='text-right text-black'>
									${player.wager.toLocaleString()}
								</TableCell>
								<TableCell className='text-right text-black'>
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
