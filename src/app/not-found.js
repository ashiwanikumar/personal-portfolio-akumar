"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
	const [glitchText, setGlitchText] = useState("404");

	useEffect(() => {
		const glitchChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
		let interval;

		const glitch = () => {
			let iterations = 0;
			interval = setInterval(() => {
				setGlitchText(
					"404".split("").map((char, index) => {
						if (index < iterations) return "404"[index];
						return glitchChars[Math.floor(Math.random() * glitchChars.length)];
					}).join("")
				);

				if (iterations >= 3) {
					clearInterval(interval);
					setGlitchText("404");
				}
				iterations += 1/3;
			}, 50);
		};

		glitch();
		const repeatGlitch = setInterval(glitch, 3000);

		return () => {
			clearInterval(interval);
			clearInterval(repeatGlitch);
		};
	}, []);

	return (
		<main className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 relative overflow-hidden">
			{/* Mesh gradient background */}
			<div className="mesh-gradient" aria-hidden="true" />

			<div className="text-center relative z-10">
				{/* Terminal window */}
				<div className="glass-card rounded-2xl p-8 md:p-12 max-w-2xl mx-auto">
					{/* Terminal header */}
					<div className="flex items-center gap-2 mb-8 pb-4 border-b border-[#00ff41]/15">
						<div className="w-3 h-3 rounded-full bg-[#ff5f57]" aria-hidden="true"></div>
						<div className="w-3 h-3 rounded-full bg-[#febc2e]" aria-hidden="true"></div>
						<div className="w-3 h-3 rounded-full bg-[#28c840]" aria-hidden="true"></div>
						<span className="ml-4 text-[#00ff41]/40 font-mono text-sm">terminal@ashiwanikumar:~</span>
					</div>

					{/* Error code */}
					<div className="mb-8">
						<h1 className="text-8xl md:text-9xl font-bold font-mono tracking-wider">
							<span className="gradient-text">{glitchText}</span>
						</h1>
					</div>

					{/* Error log */}
					<div className="font-mono text-left bg-[#09090b]/60 rounded-xl p-5 mb-8 border border-[#00ff41]/10">
						<p className="text-[#00ff41]/70 mb-2">
							<span className="text-[#00aaff]">$</span> cat /var/log/error.log
						</p>
						<p className="text-[#ff6b6b]/80 mb-2">
							ERROR: Page not found
						</p>
						<p className="text-[#00cc33]/60 mb-2">
							The requested resource could not be located on this server.
						</p>
						<p className="text-[#00ff41]/50">
							<span className="text-[#00aaff]">$</span> <span className="animate-pulse">_</span>
						</p>
					</div>

					{/* Navigation */}
					<div className="space-y-6">
						<p className="text-[#00cc33]/50 font-mono text-xs">
							// Suggested actions:
						</p>

						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<Link
								href="/"
								className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00ff41] to-[#00cc88] text-[#09090b] font-bold rounded-xl hover:shadow-[0_0_30px_rgba(0,255,65,0.4)] transition-all duration-300 font-mono text-sm"
							>
								<i className="fa-solid fa-home" aria-hidden="true"></i>
								cd ~/home
							</Link>
							<Link
								href="/contact"
								className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-[#00ff41]/30 hover:border-[#00ff41] text-[#00ff41] font-bold rounded-xl hover:bg-[#00ff41]/5 transition-all duration-300 font-mono text-sm"
							>
								<i className="fa-solid fa-envelope" aria-hidden="true"></i>
								./contact.sh
							</Link>
						</div>
					</div>

					{/* Quick links */}
					<nav className="mt-8 pt-6 border-t border-[#00ff41]/10" aria-label="Quick navigation">
						<p className="text-[#00cc33]/40 font-mono text-xs mb-4">
							// Quick navigation:
						</p>
						<div className="flex flex-wrap justify-center gap-4">
							{["/about", "/services", "/portfolio", "/resume"].map((path) => (
								<Link
									key={path}
									href={path}
									className="text-[#00ff41]/60 hover:text-[#00ff41] font-mono text-sm transition-colors duration-300"
								>
									{path}
								</Link>
							))}
						</div>
					</nav>
				</div>
			</div>
		</main>
	);
}
