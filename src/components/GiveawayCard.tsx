import { Button } from "@/components/ui/button";
import { Clock, Users, Gift } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export type GiveawayStatus = "active" | "completed" | "upcoming";

interface GiveawayCardProps {
	id: string;
	title: string;
	prize: string;
	endTime: string;
	participants: number;
	maxParticipants?: number;
	status: GiveawayStatus;
	isEntered?: boolean;
	onEnter?: (id: string) => void;
}

export function GiveawayCard({
	id,
	title,
	prize,
	endTime,
	participants,
	maxParticipants = 100,
	status,
	isEntered = false,
	onEnter,
}: GiveawayCardProps) {
	const participationPercentage = Math.min(
		100,
		Math.floor((participants / maxParticipants) * 100)
	);

	return (
		<div className='overflow-hidden rounded-lg border border-red-600 bg-[#010001]'>
			{/* Accent top bar */}
			<div className='h-3 bg-gradient-to-r from-red-600 via-red-500 to-red-400' />

			<div className='p-5 text-[#f4f5f4]'>
				<div className='flex items-start justify-between'>
					<h3 className='text-lg font-bold text-red-500'>{title}</h3>
					<StatusPill status={status} />
				</div>

				<div className='flex items-center gap-2 mt-4'>
					<Gift className='w-5 h-5 text-red-500' />
					<span className='text-lg font-semibold'>{prize}</span>
				</div>

				<div className='mt-4 space-y-3'>
					<div className='flex justify-between text-sm text-[#f4f5f4]/70'>
						<div className='flex items-center gap-1.5'>
							<Users className='w-4 h-4' />
							<span>{participants} participants</span>
						</div>
						<div className='flex items-center gap-1.5'>
							<Clock className='w-4 h-4' />
							<span>{endTime}</span>
						</div>
					</div>

					<Progress
						value={participationPercentage}
						className='h-2 bg-[#f4f5f4]/20'
						color='#ff0000'
					/>

					<div className='text-xs text-right text-[#f4f5f4]/60'>
						{participants} / {maxParticipants} entries
					</div>
				</div>

				<div className='mt-4'>
					{status === "active" && !isEntered && (
						<Button
							className='w-full bg-red-600 hover:bg-red-500 text-[#f4f5f4]'
							onClick={() => onEnter && onEnter(id)}
						>
							Enter Giveaway
						</Button>
					)}

					{status === "active" && isEntered && (
						<Button
							variant='outline'
							className='w-full text-red-500 border-red-500'
							disabled
						>
							Entered
						</Button>
					)}

					{status === "completed" && (
						<Button
							variant='outline'
							className='w-full text-red-400 border-red-400'
							disabled
						>
							Giveaway Ended
						</Button>
					)}

					{status === "upcoming" && (
						<Button
							variant='outline'
							className='w-full text-red-300 border-red-300'
							disabled
						>
							Coming Soon
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

function StatusPill({ status }: { status: GiveawayStatus }) {
	if (status === "active") {
		return (
			<div className='px-2 py-0.5 rounded-full bg-red-600/20 text-red-500 text-xs'>
				Active
			</div>
		);
	} else if (status === "completed") {
		return (
			<div className='px-2 py-0.5 rounded-full bg-red-400/20 text-red-400 text-xs'>
				Completed
			</div>
		);
	} else {
		return (
			<div className='px-2 py-0.5 rounded-full bg-red-300/20 text-red-300 text-xs'>
				Upcoming
			</div>
		);
	}
}
