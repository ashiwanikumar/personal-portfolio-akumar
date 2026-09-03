"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 relative overflow-hidden">
			<div className="mesh-gradient" aria-hidden="true" />

			<div className="text-center relative z-10">
				<div className="glass-card rounded-2xl p-8 md:p-12 max-w-2xl mx-auto">
					{/* Terminal header */}
					<div className="flex items-center gap-2 mb-8 pb-4 border-b border-white/10">
						<div className="w-3 h-3 rounded-full bg-[#ff5f57]" aria-hidden="true"></div>
						<div className="w-3 h-3 rounded-full bg-[#febc2e]" aria-hidden="true"></div>
						<div className="w-3 h-3 rounded-full bg-[#28c840]" aria-hidden="true"></div>
						<span className="ml-4 text-white/30 font-mono text-sm">terminal@ashiwanikumar:~</span>
					</div>

					{/* Error icon */}
					<div className="mb-8">
						<div className="w-20 h-20 mx-auto bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 rounded-2xl flex items-center justify-center">
							<i className="fa-solid fa-bug text-3xl text-[#ff6b6b]/80" aria-hidden="true"></i>
						</div>
					</div>

					<h1 className="text-3xl md:text-4xl font-bold font-mono mb-4">
						<span className="gradient-text">System Error</span>
					</h1>

					<div className="font-mono text-left bg-[#09090b]/60 rounded-xl p-5 mb-8 border border-white/10">
						<p className="text-white/60 mb-2">
							<span className="text-[#38bdf8]">$</span> tail -f /var/log/error.log
						</p>
						<p className="text-[#ff6b6b]/80 mb-2">
							ERROR: Something went wrong
						</p>
						<p className="text-white/50 mb-2">
							An unexpected error occurred while processing your request.
						</p>
						<p className="text-white/30 text-sm">
							The system administrators have been notified.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<button
							onClick={() => reset()}
							className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#10b981] hover:bg-[#34d399] text-[#022c22] font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 font-mono text-sm"
						>
							<i className="fa-solid fa-rotate-right" aria-hidden="true"></i>
							./retry.sh
						</button>
						<Link
							href="/"
							className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-white/10 hover:border-white/25 text-white/60 hover:text-white font-semibold rounded-xl hover:bg-[#10b981]/5 transition-all duration-300 font-mono text-sm"
						>
							<i className="fa-solid fa-home" aria-hidden="true"></i>
							cd ~/home
						</Link>
					</div>

					<div className="mt-8 pt-6 border-t border-white/10">
						<p className="text-white/40 font-mono text-sm">
							// If the problem persists, contact:{" "}
							<a href="mailto:ashvanikumar109@gmail.com" className="text-[#34d399] hover:underline transition-colors">
								ashvanikumar109@gmail.com
							</a>
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}
