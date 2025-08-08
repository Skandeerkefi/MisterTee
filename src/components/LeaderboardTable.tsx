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
	monthly: { 1: 300, 2: 125, 3: 75 },
};

export function LeaderboardTable({ period, data }: LeaderboardTableProps) {
	if (!data || data.length === 0) {
		return (
			<div className='text-center py-10 text-[#38BDF8]'>
				No leaderboard data available for {period}.
			</div>
		);
	}

	return (
		<div className='overflow-hidden border rounded-lg border-[#FFFFFF]/20'>
			<Table>
				<TableHeader className='bg-[#161A34]/90'>
					<TableRow>
						<TableHead className='w-12 text-center text-[#CF9F86]'>
							Rank
						</TableHead>
						<TableHead className='text-[#FFFFFF]'>Player</TableHead>
						<TableHead className='text-right text-[#FFFFFF]'>Wager</TableHead>
						<TableHead className='text-right text-[#38BDF8]'>Prize</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((player) => {
						const prize = PRIZES[period]?.[player.rank] || 0;

						return (
							<TableRow
								key={player.username}
								className={player.isFeatured ? "bg-[#38BDF8]/10" : ""}
							>
								<TableCell className='font-medium text-center text-[#CF9F86]'>
									{player.rank <= 3 ? (
										<div className='flex items-center justify-center'>
											<Crown
												className={`h-4 w-4 ${
													player.rank === 1
														? "text-[#38BDF8]"
														: player.rank === 2
														? "text-[#FFFFFF]/80"
														: "text-[#CF9F86]"
												}`}
											/>
										</div>
									) : (
										player.rank
									)}
								</TableCell>
								<TableCell className='flex items-center gap-2 font-medium text-[#FFFFFF]'>
									{player.username}
									{player.isFeatured && (
										<Badge
											variant='outline'
											className='border-[#38BDF8] text-[#38BDF8]'
										>
											Streamer
										</Badge>
									)}
								</TableCell>
								<TableCell className='text-right text-[#FFFFFF]'>
									${player.wager.toLocaleString()}
								</TableCell>
								<TableCell className='text-right text-[#CF9F86]'>
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
