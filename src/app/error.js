"use client";

import { useEffect } from "react";
import Link from "next/link";

const CONTACT_EMAIL = "ashvanikumar109@gmail.com";

// Next 16.2+ passes `retry` (re-fetches and re-renders the segment); older
// versions only pass `reset`. Prefer retry, fall back to reset.
export default function ErrorPage({ error, retry, reset }) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	const tryAgain = typeof retry === "function" ? retry : reset;
	const digest = error?.digest;
	const mailSubject = encodeURIComponent(`Error on ashiwanikumar.com${digest ? ` (${digest})` : ""}`);

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

					<div className="mb-6" aria-hidden="true">
						<div className="w-16 h-16 mx-auto bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 rounded-2xl flex items-center justify-center">
							<i className="fa-solid fa-bug text-2xl text-[#ff6b6b]/80"></i>
						</div>
					</div>

					<h1 className="text-2xl md:text-3xl font-semibold mb-4 tracking-[-0.02em]">
						<span className="gradient-text">This page didn&apos;t load properly</span>
					</h1>

					<p className="text-white/65 leading-relaxed mb-6 max-w-lg mx-auto">
						Something failed while loading this page. It&apos;s usually a temporary problem, so trying again often fixes it. If it keeps happening, send me an email and mention which page you were on.
					</p>

					{digest && (
						<p className="font-mono text-xs text-white/40 mb-6 break-all">
							Error reference: <span className="text-white/60">{digest}</span>
						</p>
					)}

					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<button
							type="button"
							onClick={() => tryAgain?.()}
							className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#10b981] hover:bg-[#34d399] text-[#022c22] font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 text-sm cursor-pointer"
						>
							<i className="fa-solid fa-rotate-right" aria-hidden="true"></i>
							Try again
						</button>
						<Link
							href="/"
							className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-white/10 hover:border-white/25 text-white/70 hover:text-white font-semibold rounded-xl hover:bg-[#10b981]/5 transition-all duration-300 text-sm"
						>
							<i className="fa-solid fa-house" aria-hidden="true"></i>
							Back to the homepage
						</Link>
					</div>

					<div className="mt-8 pt-6 border-t border-white/10">
						<p className="text-white/45 text-sm">
							Still broken? Email{" "}
							<a
								href={`mailto:${CONTACT_EMAIL}?subject=${mailSubject}`}
								className="text-[#34d399] hover:text-[#6ee7b7] underline underline-offset-4 decoration-[#34d399]/40 transition-colors break-all"
							>
								{CONTACT_EMAIL}
							</a>
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}
