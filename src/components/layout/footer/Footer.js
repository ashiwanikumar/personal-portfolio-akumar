"use client";
import Link from "next/link";

const Footer = () => {
	return (
		<footer role="contentinfo">
			<div className="footer-inner bg-[#09090b] border-t border-white/5">
				<div className="container">
					<div className="flex flex-col items-center pt-12 pb-10">
						{/* Legal Links */}
						<div>
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
											className="text-white/30 hover:text-[#34d399] text-xs transition-all duration-300"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div className="text-white/25 text-xs mt-6 font-mono">
							&copy; {new Date().getFullYear()} Ashiwani Kumar · Built in Abu Dhabi, runs everywhere.
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
