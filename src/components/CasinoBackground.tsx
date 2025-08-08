function CasinoBackground() {
	return (
		<div className='absolute inset-0 overflow-hidden pointer-events-none -z-10'>
			{/* Stars */}
			<svg
				className='absolute top-0 left-0 w-full h-full opacity-20'
				viewBox='0 0 100 100'
				preserveAspectRatio='xMidYMid slice'
				xmlns='http://www.w3.org/2000/svg'
			>
				{[...Array(30)].map((_, i) => {
					const cx = Math.random() * 100;
					const cy = Math.random() * 100;
					const r = Math.random() * 0.8 + 0.2;
					return <circle key={i} cx={cx} cy={cy} r={r} fill='#000000' />;
				})}
			</svg>

			{/* Coins */}
			<svg
				className='absolute bottom-0 right-0 w-40 h-40 opacity-10 animate-spin-slow'
				viewBox='0 0 64 64'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
			>
				{/* Simple stylized coin */}
				<circle
					cx='32'
					cy='32'
					r='30'
					stroke='#000000'
					strokeWidth='2'
					fill='#F5F5F5'
				/>
				<circle
					cx='32'
					cy='32'
					r='20'
					stroke='#000000'
					strokeWidth='1'
					fill='#E0E0E0'
				/>
				<text
					x='32'
					y='38'
					textAnchor='middle'
					fontSize='18'
					fill='#000000'
					fontWeight='bold'
					fontFamily='Arial'
				>
					$
				</text>
			</svg>
		</div>
	);
}
