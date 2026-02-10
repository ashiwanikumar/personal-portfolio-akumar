"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

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

					{/* Error icon */}
					<div className="mb-6">
						<div className="w-24 h-24 mx-auto bg-[#ff6b6b]/10 border-2 border-[#ff6b6b] rounded-full flex items-center justify-center">
							<i className="fa-solid fa-bug text-4xl text-[#ff6b6b]"></i>
						</div>
					</div>

					{/* Error message */}
					<h1 className="text-3xl md:text-4xl font-bold text-[#00ff41] font-mono mb-4">
						System Error
					</h1>

					<div className="font-mono text-left bg-[#001100] rounded-lg p-4 mb-8">
						<p className="text-[#00ff41] mb-2">
							<span className="text-[#00ff88]">$</span> tail -f /var/log/error.log
						</p>
						<p className="text-[#ff6b6b] mb-2">
							ERROR: Something went wrong
						</p>
						<p className="text-[#00cc33] mb-2">
							An unexpected error occurred while processing your request.
						</p>
						<p className="text-[#00cc33]/70 text-sm">
							The system administrators have been notified.
						</p>
					</div>

					{/* Actions */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button
							onClick={() => reset()}
							className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00ff41] text-[#001100] font-bold rounded-lg hover:bg-[#00ff88] hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] transition-all duration-300 font-mono"
						>
							<i className="fa-solid fa-rotate-right"></i>
							./retry.sh
						</button>

						<Link
							href="/"
							className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-[#00ff41] text-[#00ff41] font-bold rounded-lg hover:bg-[#00ff41]/10 hover:shadow-[0_0_20px_rgba(0,255,65,0.3)] transition-all duration-300 font-mono"
						>
							<i className="fa-solid fa-home"></i>
							cd ~/home
						</Link>
					</div>

					{/* Contact info */}
					<div className="mt-8 pt-6 border-t border-[#00ff41]/20">
						<p className="text-[#00cc33]/70 font-mono text-sm">
							// If the problem persists, contact:{" "}
							<a href="mailto:ashvanikumar109@gmail.com" className="text-[#00ff41] hover:text-[#00ff88]">
								ashvanikumar109@gmail.com
							</a>
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}
