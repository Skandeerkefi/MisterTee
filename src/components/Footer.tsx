import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className='py-6 mt-16 border-t border-[#E0E0E0] bg-[#FFFFFF] text-[#000000]'>
			<div className='container mx-auto'>
				<div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
					{/* About */}
					<div>
						<h3 className='mb-3 text-lg font-bold text-black'>MisterTee</h3>
						<p className='text-sm text-[#333333]'>
							Join MisterTee&apos;s community for exciting gambling streams,
							giveaways, and more. Use affiliate code{" "}
							<span className='font-semibold text-black'>MisterTee</span> on
							Rainbet.
						</p>
					</div>

					{/* Links */}
					<div>
						<h3 className='mb-3 text-lg font-bold text-black'>Links</h3>
						<div className='grid grid-cols-2 gap-2'>
							<Link
								to='/'
								className='text-sm text-[#555555] transition-colors hover:text-black'
							>
								Home
							</Link>
							<Link
								to='/leaderboard'
								className='text-sm text-[#555555] transition-colors hover:text-black'
							>
								Leaderboard
							</Link>
							<Link
								to='/terms'
								className='text-sm text-[#555555] transition-colors hover:text-black'
							>
								Terms & Conditions
							</Link>
							<Link
								to='/privacy'
								className='text-sm text-[#555555] transition-colors hover:text-black'
							>
								Privacy Policy
							</Link>
						</div>
					</div>

					{/* Social */}
					<div>
						<h3 className='mb-3 text-lg font-bold text-black'>Connect</h3>
						<div className='flex gap-3'>
							<a
								href='https://kick.com/MisterTee'
								target='_blank'
								rel='noreferrer'
								className='flex items-center justify-center transition-colors bg-black rounded-full w-9 h-9 hover:bg-[#F5F5F5] hover:text-black text-white font-bold'
							>
								K
							</a>
							<a
								href='https://x.com/Mister7ee'
								target='_blank'
								rel='noreferrer'
								className='flex items-center justify-center transition-colors bg-[#555555] rounded-full w-9 h-9 hover:bg-[#F5F5F5] hover:text-black text-white font-bold'
							>
								X
							</a>
							<a
								href='https://discord.gg/YmvDexVt'
								target='_blank'
								rel='noreferrer'
								className='flex items-center justify-center transition-colors bg-[#444444] rounded-full w-9 h-9 hover:bg-[#F5F5F5] hover:text-black text-white font-bold'
							>
								D
							</a>
							<a
								href='https://www.instagram.com/MisterTee'
								target='_blank'
								rel='noreferrer'
								className='flex items-center justify-center transition-colors bg-[#000000] rounded-full w-9 h-9 hover:bg-[#F5F5F5] hover:text-black text-white font-bold'
							>
								I
							</a>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className='pt-4 mt-8 text-sm text-center text-[#555555] border-t border-[#E0E0E0]'>
					<p className='flex flex-wrap items-center justify-center gap-1 text-sm'>
						© {currentYear} MisterTee. Made with
						<Heart className='w-3 h-3 mx-1 text-black' />
						for the community by
						<a
							href='https://www.linkedin.com/in/skander-kefi/'
							target='_blank'
							rel='noreferrer'
							className='font-medium text-black hover:underline'
						>
							Skander
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
