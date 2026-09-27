"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const QUICK_LINKS = [
	{ href: "/about", label: "About" },
	{ href: "/services", label: "Services" },
	{ href: "/portfolio", label: "Portfolio" },
	{ href: "/resume", label: "Resume" },
];

export default function NotFound() {
	const pathname = usePathname();
	const [glitchText, setGlitchText] = useState("404");

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const glitchChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
		let interval;

		const glitch = () => {
			let iterations = 0;
			clearInterval(interval);
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
		<main id="main-content" className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 py-16 relative isolate overflow-hidden">
			<div className="mesh-gradient" aria-hidden="true" />

			<div className="w-full max-w-2xl text-center relative z-10">
				<div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 sm:p-8 md:p-12">
					{/* Terminal header */}
					<div className="flex items-center gap-2 mb-8 pb-4 border-b border-white/10" aria-hidden="true">
						<div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
						<div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
						<div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
						<span className="ml-4 text-white/30 font-mono text-sm truncate">terminal@ashiwanikumar:~</span>
					</div>

					<h1 className="mb-8 text-8xl md:text-9xl font-bold font-mono tracking-wider">
						<span className="sr-only">Page not found (404)</span>
						<span className="gradient-text" aria-hidden="true">{glitchText}</span>
					</h1>

					{/* Terminal output */}
					<div className="font-mono text-sm sm:text-base text-left bg-[#09090b]/60 rounded-xl p-5 mb-6 border border-white/10" aria-hidden="true">
						<p className="text-white/60 mb-2 break-all">
							<span className="text-[#34d399]">$</span> cd {pathname || "/"}
						</p>
						<p className="text-[#ff6b6b]/80 mb-2 break-all">
							cd: {pathname || "/"}: No such file or directory
						</p>
						<p className="text-white/40">
							<span className="text-[#34d399]">$</span> <span className="animate-pulse motion-reduce:animate-none">_</span>
						</p>
					</div>

					<p className="text-white/65 leading-relaxed mb-8 max-w-lg mx-auto">
						There&apos;s no page at this address. The link may be out of date, or there could be a typo in the URL. If a link on this site sent you here, let me know and I&apos;ll fix it.
					</p>

					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Link
							href="/"
							className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#10b981] hover:bg-[#34d399] text-[#022c22] font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 text-sm"
						>
							<i className="fa-solid fa-house" aria-hidden="true"></i>
							Back to the homepage
						</Link>
						<Link
							href="/contact"
							className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-white/10 hover:border-white/25 text-white/70 hover:text-white font-semibold rounded-xl hover:bg-[#10b981]/5 transition-all duration-300 text-sm"
						>
							<i className="fa-solid fa-envelope" aria-hidden="true"></i>
							Report a broken link
						</Link>
					</div>

					<nav className="mt-8 pt-6 border-t border-white/10" aria-label="Main pages">
						<p className="text-white/35 font-mono text-xs uppercase tracking-[0.16em] mb-4">
							Or try one of these
						</p>
						<ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
							{QUICK_LINKS.map(({ href, label }) => (
								<li key={href}>
									<Link
										href={href}
										className="text-white/55 hover:text-[#34d399] font-mono text-sm transition-colors duration-300"
									>
										{label}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</div>
		</main>
	);
}
