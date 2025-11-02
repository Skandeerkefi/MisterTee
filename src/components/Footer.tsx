import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { FaKickstarterK } from "react-icons/fa";
import { FaInstagram, FaDiscord, FaXTwitter } from "react-icons/fa6";

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className='py-6 mt-16 border-t border-[#333] bg-black text-white'>
			<div className='container mx-auto'>
				<div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
					{/* About */}
					<div>
						<h3 className='mb-3 text-lg font-bold text-white'>MisterTee</h3>
						<p className='text-sm text-white/80'>
							Join MisterTee&apos;s community for exciting gambling streams,
							giveaways, and more. Use affiliate code{" "}
							<span className='font-semibold text-[#E10600]'>MisterTee</span> on
							Roobet.
						</p>
					</div>

					{/* Links */}
					<div>
						<h3 className='mb-3 text-lg font-bold text-white'>Links</h3>
						<div className='grid grid-cols-2 gap-2'>
							<Link
								to='/'
								className='text-sm text-white/70 transition-colors hover:text-[#E10600]'
							>
								Home
							</Link>
							<Link
								to='/leaderboard'
								className='text-sm text-white/70 transition-colors hover:text-[#E10600]'
							>
								Leaderboard
							</Link>
							<Link
								to='/terms'
								className='text-sm text-white/70 transition-colors hover:text-[#E10600]'
							>
								Terms & Conditions
							</Link>
							<Link
								to='/privacy'
								className='text-sm text-white/70 transition-colors hover:text-[#E10600]'
							>
								Privacy Policy
							</Link>
						</div>
					</div>

					{/* Social & Affiliates */}
					<div>
						<h3 className='mb-3 text-lg font-bold text-white'>Connect</h3>
						<div className='flex flex-wrap gap-3'>
							<a
								href='https://kick.com/MisterTee'
								target='_blank'
								rel='noreferrer'
								className='flex items-center justify-center transition-colors bg-[#111] rounded-full w-9 h-9 hover:bg-[#E10600] text-white'
							>
								<FaKickstarterK className='w-5 h-5' />
							</a>
							<a
								href='https://x.com/Mister7ee'
								target='_blank'
								rel='noreferrer'
								className='flex items-center justify-center transition-colors bg-[#111] rounded-full w-9 h-9 hover:bg-[#E10600] text-white'
							>
								<FaXTwitter className='w-5 h-5' />
							</a>
							<a
								href='https://discord.gg/uUtsNgqbgS'
								target='_blank'
								rel='noreferrer'
								className='flex items-center justify-center transition-colors bg-[#111] rounded-full w-9 h-9 hover:bg-[#E10600] text-white'
							>
								<FaDiscord className='w-5 h-5' />
							</a>
							<a
								href='https://roobet.com/?code=MisterTee'
								target='_blank'
								rel='noreferrer'
								className='flex items-center justify-center transition-colors bg-[#111] rounded-full w-9 h-9 hover:bg-[#E10600] p-1'
							>
								<img
									src='https://i.ibb.co/4w1vNNHT/65c0f428cc0de4676934f8d5-logob.png'
									alt='Roobet'
									className='object-contain w-full h-full'
								/>
							</a>
							<a
								href='https://csgowin.com/r/mistertee'
								target='_blank'
								rel='noreferrer'
								className='flex items-center justify-center transition-colors bg-[#111] rounded-full w-9 h-9 hover:bg-[#E10600] p-1'
							>
								<img
									src='https://i.ibb.co/nMcmgFTc/Screenshot-2025-10-27-183032-removebg-preview.png'
									alt='CSGOWIN'
									className='object-contain w-full h-full'
								/>
							</a>
						</div>
					</div>

					{/* Gambling Warning */}
					<div className='md:text-right'>
						<h4 className='text-lg font-bold text-[#E10600] mb-2'>
							BEWARE GAMBLING
						</h4>
						<p className='text-sm text-white/80 leading-relaxed'>
							We are not responsible for illegal gambling activities.
							<br />
							Play responsibly — gambling involves financial risks.
							<br />
							Ensure compliance with your local laws.
							<br />
							Seek help if you experience gambling issues.
						</p>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className='pt-4 mt-8 text-sm text-center text-white/70 border-t border-[#333]'>
					<p className='flex flex-wrap items-center justify-center gap-1 text-sm'>
						© {currentYear} MisterTee. Made with
						<Heart className='w-3 h-3 mx-1 text-[#E10600]' />
						for the community by{" "}
						<a
							href='https://www.linkedin.com/in/skander-kefi/'
							target='_blank'
							rel='noreferrer'
							className='font-medium text-white hover:text-[#E10600]'
						>
							Skander
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
