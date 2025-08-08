import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className='py-6 mt-16 border-t border-[#CF9F86]/20 bg-[#161A34] text-white'>
			<div className='container mx-auto'>
				<div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
					<div>
						<h3 className='mb-3 text-lg font-bold text-[#CF9F86]'>
							MONEYLIFE1K
						</h3>
						<p className='text-sm text-[#545F7D]'>
							Join MONEYLIFE1K&apos;s community for exciting gambling streams,
							giveaways, and more. Use affiliate code{" "}
							<span className='font-semibold text-[#CF9F86]'>MONEYLIFE</span> on
							Rainbet.
						</p>
					</div>

					<div>
						<h3 className='mb-3 text-lg font-bold text-[#CF9F86]'>Links</h3>
						<div className='grid grid-cols-2 gap-2'>
							<Link
								to='/'
								className='text-sm text-[#38BDF8] hover:text-[#CF9F86] transition-colors'
							>
								Home
							</Link>
							<Link
								to='/leaderboard'
								className='text-sm text-[#38BDF8] hover:text-[#CF9F86] transition-colors'
							>
								Leaderboard
							</Link>
							{/* Uncomment if needed */}
							{/* <Link to="/slot-calls" className="text-sm text-[#38BDF8] hover:text-[#CF9F86] transition-colors">
                Slot Calls
              </Link>
              <Link to="/giveaways" className="text-sm text-[#38BDF8] hover:text-[#CF9F86] transition-colors">
                Giveaways
              </Link> */}
							<Link
								to='/terms'
								className='text-sm text-[#38BDF8] hover:text-[#CF9F86] transition-colors'
							>
								Terms & Conditions
							</Link>
							<Link
								to='/privacy'
								className='text-sm text-[#38BDF8] hover:text-[#CF9F86] transition-colors'
							>
								Privacy Policy
							</Link>
						</div>
					</div>

					<div>
						<h3 className='mb-3 text-lg font-bold text-[#CF9F86]'>Connect</h3>
						<div className='flex gap-3'>
							<a
								href='https://kick.com/MONEYLIFE1K'
								target='_blank'
								rel='noreferrer'
								className='w-9 h-9 rounded-full flex items-center justify-center bg-[#AF2D03] hover:bg-[#CF9F86] transition-colors'
							>
								K
							</a>
							<a
								href='https://x.com/moneylife1k?s=21'
								target='_blank'
								rel='noreferrer'
								className='w-9 h-9 rounded-full flex items-center justify-center bg-[#545F7D] hover:bg-[#CF9F86] transition-colors'
							>
								X
							</a>
							<a
								href='https://discord.com/invite/49aCsAvsBn'
								target='_blank'
								rel='noreferrer'
								className='w-9 h-9 rounded-full flex items-center justify-center bg-[#38BDF8] hover:bg-[#CF9F86] transition-colors'
							>
								D
							</a>
							<a
								href='https://www.instagram.com/moneylife1k'
								target='_blank'
								rel='noreferrer'
								className='w-9 h-9 rounded-full flex items-center justify-center bg-[#CF9F86] hover:bg-[#38BDF8] transition-colors'
							>
								I
							</a>
							<a
								href='https://www.youtube.com/@MONEYLIFE1K'
								target='_blank'
								rel='noreferrer'
								className='w-9 h-9 rounded-full flex items-center justify-center bg-[#ff4a26] hover:bg-[#38BDF8] transition-colors'
							>
								Y
							</a>
						</div>
					</div>
				</div>

				<div className='pt-4 mt-8 text-sm text-center border-t border-[#CF9F86]/20 text-[#545F7D]'>
					<p className='flex flex-wrap items-center justify-center gap-1 text-sm'>
						© {currentYear} MONEYLIFE1K. Made with
						<Heart className='w-3 h-3 mx-1 text-[#AF2D03]' />
						for the community by
						<a
							href='https://www.linkedin.com/in/skander-kefi/'
							target='_blank'
							rel='noreferrer'
							className='font-medium text-[#CF9F86] hover:underline'
						>
							Skander
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
