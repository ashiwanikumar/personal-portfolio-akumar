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
		<main className="min-h-screen bg-[#001100] flex items-center justify-center px-4">
			<div className="text-center">
				{/* Terminal window */}
				<div className="bg-[#002200] border border-[#00ff41]/30 rounded-lg p-8 md:p-12 max-w-2xl mx-auto">
					{/* Terminal header */}
					<div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#00ff41]/20">
						<div className="w-3 h-3 rounded-full bg-red-500"></div>
						<div className="w-3 h-3 rounded-full bg-yellow-500"></div>
						<div className="w-3 h-3 rounded-full bg-green-500"></div>
						<span className="ml-4 text-[#00ff41]/50 font-mono text-sm">terminal@ashiwanikumar:~</span>
					</div>

					{/* Error code */}
					<div className="mb-6">
						<h1 className="text-8xl md:text-9xl font-bold text-[#00ff41] font-mono tracking-wider animate-pulse">
							{glitchText}
						</h1>
					</div>

					{/* Error message */}
					<div className="font-mono text-left bg-[#001100] rounded-lg p-4 mb-8">
						<p className="text-[#00ff41] mb-2">
							<span className="text-[#00ff88]">$</span> cat /var/log/error.log
						</p>
						<p className="text-[#ff6b6b] mb-2">
							ERROR: Page not found
						</p>
						<p className="text-[#00cc33] mb-2">
							The requested resource could not be located on this server.
						</p>
						<p className="text-[#00ff41]">
							<span className="text-[#00ff88]">$</span> <span className="animate-pulse">_</span>
						</p>
					</div>

					{/* Navigation options */}
					<div className="space-y-4">
						<p className="text-[#00cc33] font-mono text-sm mb-6">
							// Suggested actions:
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								href="/"
								className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00ff41] text-[#001100] font-bold rounded-lg hover:bg-[#00ff88] hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] transition-all duration-300 font-mono"
							>
								<i className="fa-solid fa-home"></i>
								cd ~/home
							</Link>

							<Link
								href="/contact"
								className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-[#00ff41] text-[#00ff41] font-bold rounded-lg hover:bg-[#00ff41]/10 hover:shadow-[0_0_20px_rgba(0,255,65,0.3)] transition-all duration-300 font-mono"
							>
								<i className="fa-solid fa-envelope"></i>
								./contact.sh
							</Link>
						</div>
					</div>

					{/* Quick links */}
					<div className="mt-8 pt-6 border-t border-[#00ff41]/20">
						<p className="text-[#00cc33]/70 font-mono text-xs mb-4">
							// Quick navigation:
						</p>
						<div className="flex flex-wrap justify-center gap-4">
							<Link href="/about" className="text-[#00ff41] hover:text-[#00ff88] font-mono text-sm transition-colors">
								/about
							</Link>
							<Link href="/services" className="text-[#00ff41] hover:text-[#00ff88] font-mono text-sm transition-colors">
								/services
							</Link>
							<Link href="/portfolio" className="text-[#00ff41] hover:text-[#00ff88] font-mono text-sm transition-colors">
								/portfolio
							</Link>
							<Link href="/resume" className="text-[#00ff41] hover:text-[#00ff88] font-mono text-sm transition-colors">
								/resume
							</Link>
						</div>
					</div>
				</div>

				{/* ASCII art decoration */}
				<div className="mt-8 text-[#00ff41]/20 font-mono text-xs hidden md:block">
					<pre>{`
     _    ___  _  _
    | |  / _ \\| || |
    | |_| | | | || |_
    |___|_| |_|_|\___|
					`}</pre>
				</div>
			</div>
		</main>
	);
}
