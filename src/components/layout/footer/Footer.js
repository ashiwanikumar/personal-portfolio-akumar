"use client";
import Image from "next/image";
import Link from "next/link";
import ShareButton from "@/components/shared/buttons/ShareButton";

const Footer = () => {
	return (
		<footer role="contentinfo">
			<div className="footer-inner bg-[#09090b] border-t border-white/5">
				<div className="container">
					<div className="flex flex-col items-center pt-14 pb-8">
						{/* Logo */}
						<div className="footer-logo w-[70px] h-[70px] mb-8">
							<Link href="/" aria-label="Go to homepage">
								<Image
									src="/img/logo/logo.png"
									alt="Ashiwani Kumar - Linux DevOps Engineer"
									width={400}
									height={400}
								/>
							</Link>
						</div>

						{/* Navigation */}
						<nav aria-label="Footer navigation">
							<ul className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3">
								{["About", "Services", "Portfolio", "Blog", "Guides", "Glossary", "Resume", "Contact"].map((item) => (
									<li key={item}>
										<Link
											href={`/${item.toLowerCase()}`}
											className="text-[#00ff41]/70 hover:text-[#00ff41] text-sm font-medium uppercase tracking-[0.15em] transition-all duration-300 font-mono"
										>
											{item}
										</Link>
									</li>
								))}
							</ul>
						</nav>

						{/* Legal Links */}
						<div className="mt-6">
							<ul className="flex flex-wrap justify-center items-center gap-x-2 gap-y-2">
								{[
									{ label: "Privacy Notice", href: "/privacy-notice" },
									{ label: "Terms & Conditions", href: "/terms-and-conditions" },
									{ label: "Cookies Policy", href: "/cookies-policy" },
								].map((link, idx) => (
									<li key={link.href} className="flex items-center gap-2">
										{idx > 0 && <span className="text-[#00ff41]/20" aria-hidden="true">|</span>}
										<Link
											href={link.href}
											className="text-white/30 hover:text-[#00ff41] text-xs font-mono transition-all duration-300"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Share */}
						<div className="mt-6">
							<ShareButton />
						</div>

						<div className="text-white/25 text-xs mt-6 font-mono">
							&copy; {new Date().getFullYear()} Ashiwani Kumar. All rights reserved.
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
