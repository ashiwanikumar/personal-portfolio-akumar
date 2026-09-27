"use client";
import Link from "next/link";

const socialLinks = [
	{
		label: "LinkedIn",
		href: "https://www.linkedin.com/in/ashiwanikumar/",
		icon: "fa-brands fa-linkedin-in",
	},
	{
		label: "GitHub",
		href: "https://github.com/ashiwanikumar",
		icon: "fa-brands fa-github",
	},
	{
		label: "X",
		href: "https://x.com/byteforge_ai",
		icon: "fa-brands fa-x-twitter",
	},
];

const Footer = () => {
	return (
		<footer>
			<div className="footer-inner bg-[#09090b] border-t border-white/5">
				<div className="container">
					<div className="flex flex-col items-center pt-12 pb-10">
						{/* Social + email */}
						<ul className="flex items-center gap-3 mb-6">
							{socialLinks.map(({ label, href, icon }) => (
								<li key={label}>
									<a
										href={href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`${label} (opens in a new tab)`}
										className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-white/50 text-sm hover:text-[#34d399] hover:border-[#10b981]/50 transition-all duration-300"
									>
										<i className={icon} aria-hidden="true"></i>
									</a>
								</li>
							))}
							<li>
								<a
									href="mailto:ashvanikumar109@gmail.com"
									aria-label="Email ashvanikumar109@gmail.com"
									className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-white/50 text-sm hover:text-[#34d399] hover:border-[#10b981]/50 transition-all duration-300"
								>
									<i className="fa-solid fa-envelope" aria-hidden="true"></i>
								</a>
							</li>
						</ul>

						{/* Legal Links */}
						<nav aria-label="Legal">
							<ul className="flex flex-wrap justify-center items-center gap-x-2 gap-y-2">
								{[
									{ label: "Privacy Notice", href: "/privacy-notice" },
									{ label: "Terms & Conditions", href: "/terms-and-conditions" },
									{ label: "Cookies Policy", href: "/cookies-policy" },
								].map((link, idx) => (
									<li key={link.href} className="flex items-center gap-2">
										{idx > 0 && <span className="text-white/15" aria-hidden="true">·</span>}
										<Link
											href={link.href}
											className="text-white/50 hover:text-[#34d399] text-xs transition-all duration-300"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</nav>

						<div className="text-white/45 text-xs mt-6 font-mono" suppressHydrationWarning>
							&copy; {new Date().getFullYear()} Ashiwani Kumar · Built in Abu Dhabi, runs everywhere.
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
