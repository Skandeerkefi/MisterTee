import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SlotCallCard } from "@/components/SlotCallCard";
import { useSlotCallStore } from "@/store/useSlotCallStore";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useDebounce } from "@/hooks/use-debounce";

type FilterStatus = "all" | "pending" | "accepted" | "rejected" | "played";

function SlotCallsPage() {
	const {
		slotCalls,
		addSlotCall,
		updateSlotStatus,
		submitBonusCall,
		fetchSlotCalls,
		isSubmitting,
		deleteSlotCall,
	} = useSlotCallStore();

	const { user, token } = useAuthStore();
	const { toast } = useToast();
	const handleToggleX250 = async (id: string, newValue: boolean) => {
		const result = await updateSlotStatus(id, "played", newValue); // keep status 'played'
		if (result.success) {
			toast({ title: "Updated", description: "x250 hit toggled." });
			await fetchSlotCalls();
		} else {
			toast({
				title: "Error",
				description: result.error || "Failed to toggle x250",
				variant: "destructive",
			});
		}
	};
	const [searchQuery, setSearchQuery] = useState("");
	const [slotName, setSlotName] = useState("");
	const [filter, setFilter] = useState<FilterStatus>("all");
	const [showOnly250Hit, setShowOnly250Hit] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const debouncedSearchQuery = useDebounce(searchQuery, 300);
	const isAdmin = user?.role === "admin";

	useEffect(() => {
		if (token) {
			fetchSlotCalls().finally(() => setIsLoading(false));
		} else {
			setIsLoading(false);
		}
	}, [token]);

	const filteredSlotCalls = useMemo(() => {
		return slotCalls.filter((call) => {
			const query = debouncedSearchQuery.toLowerCase();
			const matchesSearch =
				call.slotName.toLowerCase().includes(query) ||
				call.requester.toLowerCase().includes(query);

			const matchesStatus = filter === "all" || call.status === filter;
			const matches250 = !showOnly250Hit || call.x250Hit;

			return matchesSearch && matchesStatus && matches250;
		});
	}, [slotCalls, debouncedSearchQuery, filter, showOnly250Hit]);

	const handleSubmit = async () => {
		if (!slotName.trim()) {
			toast({
				title: "Error",
				description: "Slot name is required.",
				variant: "destructive",
			});
			return;
		}

		const result = await addSlotCall(slotName.trim());
		if (result.success) {
			toast({ title: "Submitted", description: "Slot call sent!" });
			setSlotName("");
			await fetchSlotCalls();
		} else {
			toast({
				title: "Error",
				description: result.error || "Something went wrong.",
				variant: "destructive",
			});
		}
	};

	const handleAccept = async (id: string, newX250Value: boolean) => {
		const result = await updateSlotStatus(id, "accepted", newX250Value);
		if (result.success) {
			toast({ title: "Updated", description: "Slot status updated." });
			await fetchSlotCalls();
		} else {
			toast({
				title: "Error",
				description: result.error || "Failed to update slot",
				variant: "destructive",
			});
		}
	};

	const handleReject = async (id: string) => {
		const result = await updateSlotStatus(id, "rejected");
		if (result.success) {
			toast({ title: "Rejected", description: "Slot call rejected." });
			await fetchSlotCalls();
		} else {
			toast({
				title: "Error",
				description: result.error || "Failed to reject slot call",
				variant: "destructive",
			});
		}
	};

	const handleBonusSubmit = async (id: string, slotName: string) => {
		const result = await submitBonusCall(id, slotName);
		if (result.success) {
			toast({
				title: "Bonus Call Submitted",
				description: "Bonus call saved successfully.",
			});
			await fetchSlotCalls();
		} else {
			toast({
				title: "Error",
				description: result.error || "Failed to submit bonus call",
				variant: "destructive",
			});
		}
	};

	const handleDelete = async (id: string) => {
		const result = await deleteSlotCall(id);
		if (result.success) {
			toast({
				title: "Deleted",
				description: "Slot call deleted successfully.",
			});
		} else {
			toast({
				title: "Error",
				description: result.error || "Failed to delete slot call",
				variant: "destructive",
			});
		}
	};

	const handleMarkPlayed = async (id: string) => {
		const result = await updateSlotStatus(id, "played");
		if (result.success) {
			toast({ title: "Marked Played", description: "Slot marked as played." });
			await fetchSlotCalls();
		} else {
			toast({
				title: "Error",
				description: result.error || "Failed to mark played",
				variant: "destructive",
			});
		}
	};

	return (
		<div className='flex flex-col min-h-screen bg-[#191F3B] text-white'>
			<Navbar />
			<main className='container flex-grow py-8'>
				<div className='flex items-center justify-between mb-4'>
					<h1 className='text-2xl font-bold'>Slot Calls</h1>
					<Dialog>
						<DialogTrigger asChild>
							<Button variant='outline' className='flex items-center gap-2'>
								<Plus className='w-4 h-4' /> New Slot Call
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>New Slot Call</DialogTitle>
								<DialogDescription>
									Submit a new slot call to the system.
								</DialogDescription>
							</DialogHeader>
							<div className='flex flex-col gap-2'>
								<Input
									placeholder='Slot Name'
									value={slotName}
									onChange={(e) => setSlotName(e.target.value)}
									disabled={isSubmitting}
								/>
								<DialogFooter>
									<Button
										onClick={handleSubmit}
										disabled={isSubmitting || !slotName.trim()}
									>
										Submit
									</Button>
								</DialogFooter>
							</div>
						</DialogContent>
					</Dialog>
				</div>

				<div className='flex flex-wrap items-center gap-4 mb-6'>
					<Input
						placeholder='Search slot name or requester...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='flex-grow max-w-sm'
					/>

					<Tabs
						value={filter}
						onValueChange={(val) => setFilter(val as FilterStatus)}
						className='flex-grow max-w-lg'
					>
						<TabsList>
							<TabsTrigger value='all'>All</TabsTrigger>
							<TabsTrigger value='pending'>Pending</TabsTrigger>
							<TabsTrigger value='accepted'>Accepted</TabsTrigger>
							<TabsTrigger value='played'>Played</TabsTrigger>
							<TabsTrigger value='rejected'>Rejected</TabsTrigger>
						</TabsList>
					</Tabs>

					<label className='flex items-center gap-2 text-sm text-white'>
						<input
							type='checkbox'
							checked={showOnly250Hit}
							onChange={(e) => setShowOnly250Hit(e.target.checked)}
						/>
						Show only 250x Hit
					</label>
				</div>

				{isLoading ? (
					<div className='text-center text-white/70'>Loading...</div>
				) : filteredSlotCalls.length === 0 ? (
					<div className='text-center text-white/70'>No slot calls found.</div>
				) : (
					<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
						{filteredSlotCalls.map((call) => (
							<SlotCallCard
								key={call.id}
								id={call.id}
								slotName={call.slotName}
								requester={call.requester}
								timestamp={call.timestamp}
								status={call.status}
								x250Hit={call.x250Hit}
								bonusCall={call.bonusCall}
								isAdminView={isAdmin}
								isUserView={!isAdmin}
								onAccept={handleAccept}
								onReject={handleReject}
								onBonusSubmit={handleBonusSubmit}
								onDelete={handleDelete}
								onMarkPlayed={handleMarkPlayed}
								onToggleX250={handleToggleX250}
							/>
						))}
					</div>
				)}
			</main>
			<Footer />
		</div>
	);
}

export default SlotCallsPage;
