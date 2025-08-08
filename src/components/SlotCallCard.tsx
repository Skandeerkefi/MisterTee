// SlotCallCard.tsx
import { useState } from "react";
import { Clock, Check, X, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type SlotCallStatus = "pending" | "accepted" | "rejected" | "played";

interface SlotCallProps {
	id: string;
	slotName: string;
	requester: string;
	timestamp: string;
	status: SlotCallStatus;
	x250Hit?: boolean;
	bonusCall?: { name: string; createdAt: string };
	onAccept?: (id: string, x250Hit: boolean) => void;
	onReject?: (id: string) => void;
	onDelete?: (id: string) => void;
	onBonusSubmit?: (id: string, bonusSlot: string) => void;
	onMarkPlayed?: (id: string) => void;
	onToggleX250?: (id: string, newValue: boolean) => void;
	isAdminView?: boolean;
	isUserView?: boolean;
}

export function SlotCallCard({
	id,
	slotName,
	requester,
	timestamp,
	status,
	x250Hit,
	bonusCall,
	onAccept,
	onReject,
	onDelete,
	onBonusSubmit,
	onMarkPlayed,
	onToggleX250,
	isAdminView = false,
	isUserView = false,
}: SlotCallProps) {
	const [bonusInput, setBonusInput] = useState("");
	const showBonusInput = isUserView && x250Hit && !bonusCall;

	return (
		<div className='flex flex-col p-4 rounded-lg glass-card bg-[#191F3B] border border-[#EA6D0C]/40 text-white'>
			<div className='flex items-start justify-between'>
				<h3 className='text-lg font-bold text-white'>{slotName}</h3>
				<StatusBadge status={status} />
			</div>

			<div className='mt-2 text-sm text-[#EA6D0C]'>
				Requested by: <span className='text-white'>{requester}</span>
			</div>

			<div className='flex items-center gap-1 mt-4 text-xs text-white'>
				<Clock className='w-3 h-3' />
				{timestamp}
			</div>

			{/* Admin Controls */}
			{isAdminView && (
				<div className='mt-4 space-y-2'>
					<label className='flex items-center gap-2 text-sm text-[#38BDF8]'>
						<input
							type='checkbox'
							checked={x250Hit || false}
							onChange={() => onToggleX250?.(id, !x250Hit)}
							disabled={status !== "played"}
						/>
						Mark as 250x Hit
					</label>

					{status === "pending" && (
						<div className='flex gap-2'>
							<button
								onClick={() => onAccept?.(id, x250Hit || false)}
								className='flex items-center justify-center flex-1 gap-1 px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700'
							>
								<Check className='w-4 h-4' /> Accept
							</button>

							<button
								onClick={() => onReject?.(id)}
								className='flex items-center justify-center flex-1 gap-1 px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700'
							>
								<X className='w-4 h-4' /> Reject
							</button>
						</div>
					)}

					{(status === "accepted" || status === "pending") && (
						<button
							onClick={() => onMarkPlayed?.(id)}
							className='w-full py-1 mt-2 bg-[#EA8105] hover:bg-[#C33B52] text-white rounded'
						>
							Mark as Played
						</button>
					)}

					{/* Delete Button */}
					<button
						onClick={() => {
							if (
								confirm(
									"Are you sure you want to delete this slot call? This action cannot be undone."
								)
							) {
								onDelete?.(id);
							}
						}}
						className='w-full py-1 mt-2 text-white bg-red-700 rounded hover:bg-red-800'
					>
						Delete
					</button>
				</div>
			)}

			{/* Bonus Call Submitted */}
			{bonusCall && (
				<div className='mt-4 text-sm text-[#38BDF8]'>
					<Gift className='inline w-4 h-4 mr-1' />
					Bonus Call:{" "}
					<span className='font-semibold text-white'>{bonusCall.name}</span>
				</div>
			)}

			{/* Bonus Call Submission */}
			{showBonusInput && (
				<div className='mt-4 space-y-2'>
					<label htmlFor={`bonus-${id}`} className='text-sm text-[#EA6D0C]'>
						🎁 20$ Bonus Call Slot Name
					</label>
					<input
						id={`bonus-${id}`}
						type='text'
						placeholder='e.g. Sugar Rush'
						value={bonusInput}
						onChange={(e) => setBonusInput(e.target.value)}
						className='w-full px-3 py-1 bg-[#191F3B] border border-[#EA6D0C] text-white rounded'
					/>
					<button
						onClick={() =>
							bonusInput.trim() && onBonusSubmit?.(id, bonusInput.trim())
						}
						className='w-full py-1 mt-1 bg-[#AF2D03] hover:bg-[#C33B52] text-white rounded'
					>
						Submit Bonus Call
					</button>
				</div>
			)}
		</div>
	);
}

function StatusBadge({ status }: { status: SlotCallStatus }) {
	const baseClass =
		"text-xs px-2 py-0.5 rounded-full border font-medium inline-block";

	switch (status) {
		case "pending":
			return (
				<span
					className={`${baseClass} text-[#EA8105] border-[#EA8105] bg-[#EA8105]/20`}
				>
					Pending
				</span>
			);
		case "accepted":
			return (
				<span
					className={`${baseClass} text-[#38BDF8] border-[#38BDF8] bg-[#38BDF8]/20`}
				>
					Accepted
				</span>
			);
		case "played":
			return (
				<span
					className={`${baseClass} text-[#34D399] border-[#34D399] bg-[#34D399]/20`}
				>
					Played
				</span>
			);
		case "rejected":
		default:
			return (
				<span
					className={`${baseClass} text-[#C33B52] border-[#C33B52] bg-[#C33B52]/20`}
				>
					Rejected
				</span>
			);
	}
}
