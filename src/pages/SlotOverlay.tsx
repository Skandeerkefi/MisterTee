import { useEffect, useState, useRef } from "react";

export default function SlotOverlay() {
	const [visibleCalls, setVisibleCalls] = useState<any[]>([]);
	const scrollRef = useRef<HTMLDivElement>(null);
	const scrollInterval = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		const fetchOverlayCalls = async () => {
			try {
				const res = await fetch(
					"https://misterteedata.onrender.com/api/slot-calls",
					{
						headers: {
							Authorization:
								"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OGJkMTg2MjQyNGJjNjllZGJmZGM4YSIsInJvbGUiOiJhZG1pbiIsImtpY2tVc2VybmFtZSI6InNrYW5kZXIiLCJpYXQiOjE3NTQyMTk1MjcsImV4cCI6MTc1NDgyNDMyN30.Obp3v8gjiCKLWHuOhVX4ncEjga1fzj-67HIBhWDvt2k",
						},
					}
				);

				if (!res.ok) throw new Error("Failed to fetch slot calls");

				const data = await res.json();

				const mappedCalls = data.map((call: any) => ({
					id: call._id,
					slotName: call.name,
					requester: call.user?.kickUsername || "Unknown",
					betAmount: call.betAmount ?? null,
					x250Hit: call.x250Hit ?? false,
					bonusCallName: call.bonusCall?.name ?? null,
				}));

				setVisibleCalls(mappedCalls);
			} catch (err) {
				console.error("Overlay fetch failed:", err);
			}
		};

		fetchOverlayCalls();
		const interval = setInterval(fetchOverlayCalls, 15000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (!scrollRef.current || visibleCalls.length <= 3) return;

		const container = scrollRef.current;
		let scrollPos = 0;
		const itemHeight = container.firstElementChild?.clientHeight || 80;
		const totalHeight = itemHeight * visibleCalls.length;

		container.scrollTop = 0;

		scrollInterval.current && clearInterval(scrollInterval.current);

		scrollInterval.current = setInterval(() => {
			scrollPos += 1;
			if (scrollPos >= totalHeight) scrollPos = 0;
			container.scrollTop = scrollPos;
		}, 20);

		return () => {
			scrollInterval.current && clearInterval(scrollInterval.current);
			if (container) container.scrollTop = 0;
		};
	}, [visibleCalls]);

	const doubledCalls = [...visibleCalls, ...visibleCalls];

	return (
		<div
			className='fixed max-w-full -translate-x-1/2 bottom-10 left-1/2 w-[26rem] pointer-events-none select-none'
			style={{ zIndex: 9999 }}
		>
			<div
				className='overflow-hidden border shadow-2xl rounded-3xl'
				style={{
					backgroundColor: "#2C2F48",
					borderColor: "#8F00FF",
					backdropFilter: "blur(10px)",
				}}
			>
				{/* Header */}
				<div
					className='py-3 text-lg font-bold tracking-wide text-center text-white rounded-t-3xl'
					style={{
						background: "linear-gradient(90deg, #8F00FF, #00F0FF)",
						color: "#fff",
						textShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
					}}
				>
					🎰 LIVE SLOT CALLS
				</div>

				{/* Scrolling Area */}
				<div
					ref={scrollRef}
					className='overflow-hidden'
					style={{ height: 240 }}
				>
					<div className='flex flex-col'>
						{doubledCalls.map((call, index) => (
							<div
								key={`${call.id}-${index}`}
								className='flex flex-col justify-center px-5 py-4 border-b last:border-none'
								style={{
									height: 80,
									borderColor: "rgba(255, 255, 255, 0.1)",
								}}
							>
								<div className='text-white text-[1.1rem] font-semibold'>
									🎰 <span style={{ color: "#00F0FF" }}>@{call.requester}</span>{" "}
									called{" "}
									<span style={{ color: "#8F00FF" }}>{call.slotName}</span>
								</div>
								<div className='text-[#CCCCCC] text-sm mt-1 flex items-center gap-3'>
									{call.betAmount !== null && (
										<span>
											for{" "}
											<span style={{ color: "#00F0FF" }}>
												${call.betAmount.toLocaleString()}
											</span>
										</span>
									)}
									{call.x250Hit && (
										<span
											className='ml-auto text-xs font-bold rounded-full'
											style={{
												backgroundColor: "#8F00FF",
												color: "#fff",
												padding: "0.2em 0.6em",
												boxShadow: "0 0 6px #8F00FF",
											}}
										>
											💥 250x HIT!
										</span>
									)}
								</div>
								{call.bonusCallName && (
									<div
										className='mt-1 text-sm italic'
										style={{ color: "#00F0FF" }}
									>
										Bonus Call:{" "}
										<span className='font-bold'>{call.bonusCallName}</span>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
