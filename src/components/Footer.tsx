import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-[#252B38] bg-[#08090D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Top section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-[#252B38]">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-3">
              <img
                src="https://i.ibb.co/x8zPpn5p/Capture-d-cran-2025-08-08-180638.png"
                alt="MisterTee"
                className="w-8 h-8 rounded-full border border-[#252B38]"
              />
              <span className="font-display font-bold text-lg text-[#F5F7FA]">
                Mister<span className="text-[#8B5CF6]">Tee</span>
              </span>
            </div>
            <p className="text-sm text-[#5F6878] text-center md:text-left max-w-xs">
              Your community. Your games. Your rewards.
            </p>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-3 gap-x-12 gap-y-2 text-center">
            {[
              { label: "Rewards", to: "/rewards" },
              { label: "Leaderboard", to: "/juice" },
              { label: "Social", to: "/socials" },
              { label: "Games", to: "/games" },
              { label: "Shop", to: "/shop" },
              { label: "Points", to: "/points-leaderboard" },
              { label: "CSGOWIN board", to: "/leaderboard" },
              { label: "Roobet board", to: "/Leaderboards" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-[#5F6878] hover:text-[#8B93A3] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
          <p className="text-xs text-[#5F6878]">
            &copy; {new Date().getFullYear()} MisterTee. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://kick.com/MisterTee"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#5F6878] hover:text-[#8B93A3] transition-colors"
            >
              Kick
            </a>
            <a
              href="https://discord.gg/mistertee"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#5F6878] hover:text-[#8B93A3] transition-colors"
            >
              Discord
            </a>
            <a
              href="https://www.youtube.com/@MisterTee"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#5F6878] hover:text-[#8B93A3] transition-colors"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>

      {/* Accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent"/>
    </footer>
  );
}