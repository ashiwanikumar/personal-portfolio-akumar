"use client";

import { useState } from "react";

const Newsletter = () => {
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState("idle"); // idle, loading, success, error

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!email) return;

		setStatus("loading");

		// Simulate subscription - replace with actual API endpoint
		setTimeout(() => {
			setStatus("success");
			setEmail("");
			setTimeout(() => setStatus("idle"), 3000);
		}, 1000);
	};

	return (
		<section id="newsletter" className="py-60px md:py-20 lg:py-30 bg-[#001100] relative overflow-hidden">
			{/* Background decoration - matrix style */}
			<div className="absolute inset-0 opacity-20">
				<div className="absolute top-10 left-10 w-40 h-40 bg-[#00ff41] rounded-full blur-[100px]"></div>
				<div className="absolute bottom-10 right-10 w-60 h-60 bg-[#00ff41] rounded-full blur-[120px]"></div>
			</div>

			<div className="container relative z-10">
				<div className="max-w-3xl mx-auto text-center">
					<div className="mb-6">
						<span className="inline-flex items-center gap-2 px-4 py-2 bg-[#00ff41]/10 border border-[#00ff41]/30 rounded-full text-[#00ff41] text-sm font-medium font-mono">
							<i className="fa-solid fa-terminal"></i>
							~/newsletter
						</span>
					</div>

					<h2 className="text-3xl md:text-size-40 lg:text-size-50 font-bold leading-1.2 text-[#00ff41] mb-6 font-mono">
						Stay Updated on DevOps & AI
					</h2>

					<p className="text-[#00cc33] text-lg leading-1.5 mb-10 max-w-xl mx-auto font-mono">
						Get insights on cloud infrastructure, Kubernetes, AI/ML ops, and the future of
						Site Reliability Engineering. No spam, just valuable content.
					</p>

					<form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
						<div className="flex-1 relative">
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="root@your-email.com"
								className="w-full px-6 py-4 rounded-lg bg-[#002200] border-2 border-[#00ff41]/40 text-[#00ff41] placeholder-[#00ff41]/50 focus:outline-none focus:border-[#00ff41] transition-all duration-300 font-mono"
								disabled={status === "loading" || status === "success"}
							/>
						</div>
						<button
							type="submit"
							disabled={status === "loading" || status === "success"}
							className="px-8 py-4 bg-[#00ff41] text-[#001100] font-bold rounded-lg hover:bg-[#00ff88] hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 font-mono"
						>
							{status === "loading" ? (
								<>
									<i className="fa-solid fa-spinner animate-spin"></i>
									Processing...
								</>
							) : status === "success" ? (
								<>
									<i className="fa-solid fa-check"></i>
									Subscribed!
								</>
							) : (
								<>
									Subscribe
									<i className="fa-solid fa-arrow-right"></i>
								</>
							)}
						</button>
					</form>

					<p className="text-[#00ff41]/50 text-sm mt-6 font-mono">
						// Join 500+ DevOps professionals. Unsubscribe anytime.
					</p>

					{/* Social proof */}
					<div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
						<div className="flex items-center gap-3">
							<div className="flex -space-x-2">
								<div className="w-10 h-10 rounded-full bg-[#00ff41]/20 border border-[#00ff41]/40 flex items-center justify-center text-[#00ff41] text-sm font-mono">AK</div>
								<div className="w-10 h-10 rounded-full bg-[#00ff41]/30 border border-[#00ff41]/40 flex items-center justify-center text-[#00ff41] text-sm font-mono">JD</div>
								<div className="w-10 h-10 rounded-full bg-[#00ff41]/20 border border-[#00ff41]/40 flex items-center justify-center text-[#00ff41] text-sm font-mono">SR</div>
							</div>
							<span className="text-[#00cc33] text-sm font-mono">Trusted by SREs worldwide</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Newsletter;
