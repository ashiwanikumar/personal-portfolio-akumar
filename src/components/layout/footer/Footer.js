"use client";
import Image from "next/image";
import Link from "next/link";
import ShareButton from "@/components/shared/buttons/ShareButton";

const Footer = () => {
	return (
		<footer>
			<div className="footer-inner bg-[#001100]">
				<div className="container">
					<div className="flex flex-col items-center pt-50px pb-5 md:pt-60px">
						{/* logo */}
						<div className="footer-logo w-75px h-75px mb-6">
							<Link href="/">
								<Image
									src="/img/logo/logo.png"
									alt="Ashiwani Kumar"
									width={400}
									height={400}
								/>
							</Link>
						</div>
						{/* <!-- nav --> */}
						<div>
							<ul className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2">
								<li>
									<Link
										href="/about"
										className="text-[#00ff41] hover:text-[#00ff88] text-sm font-medium uppercase tracking-wider transition-all duration-300 hover:text-shadow-glow"
									>
										About
									</Link>
								</li>
								<li>
									<Link
										href="/services"
										className="text-[#00ff41] hover:text-[#00ff88] text-sm font-medium uppercase tracking-wider transition-all duration-300"
									>
										Services
									</Link>
								</li>
								<li>
									<Link
										href="/portfolio"
										className="text-[#00ff41] hover:text-[#00ff88] text-sm font-medium uppercase tracking-wider transition-all duration-300"
									>
										Portfolio
									</Link>
								</li>
								<li>
									<Link
										href="/resume"
										className="text-[#00ff41] hover:text-[#00ff88] text-sm font-medium uppercase tracking-wider transition-all duration-300"
									>
										Resume
									</Link>
								</li>
								<li>
									<Link
										href="/contact"
										className="text-[#00ff41] hover:text-[#00ff88] text-sm font-medium uppercase tracking-wider transition-all duration-300"
									>
										Contact
									</Link>
								</li>
							</ul>
						</div>

						{/* Legal Links */}
						<div className="mt-6">
							<ul className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
								<li>
									<Link
										href="/privacy-notice"
										className="text-[#00cc33]/70 hover:text-[#00ff41] text-xs font-mono transition-all duration-300"
									>
										Privacy Notice
									</Link>
								</li>
								<li>
									<span className="text-[#00cc33]/30">|</span>
								</li>
								<li>
									<Link
										href="/terms-and-conditions"
										className="text-[#00cc33]/70 hover:text-[#00ff41] text-xs font-mono transition-all duration-300"
									>
										Terms & Conditions
									</Link>
								</li>
								<li>
									<span className="text-[#00cc33]/30">|</span>
								</li>
								<li>
									<Link
										href="/cookies-policy"
										className="text-[#00cc33]/70 hover:text-[#00ff41] text-xs font-mono transition-all duration-300"
									>
										Cookies Policy
									</Link>
								</li>
							</ul>
						</div>

						{/* Share Button */}
						<div className="mt-6">
							<ShareButton />
						</div>

						<div className="text-[#00cc33] text-sm mt-6 font-mono">
							© {new Date().getFullYear()} Ashiwani Kumar. All rights reserved.
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
