"use client";

import { useState } from "react";

const Newsletter = () => {
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState("idle");

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!email) return;

		setStatus("loading");
		try {
			const response = await fetch("/api/public/newsletter", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email,
					name: "",
					interests: ["devops", "cloud-infrastructure", "kubernetes"],
					screenWidth: typeof window !== "undefined" ? window.innerWidth : undefined,
					screenHeight: typeof window !== "undefined" ? window.innerHeight : undefined,
				}),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.message || "Subscription failed");
			setStatus("success");
			setEmail("");
			setTimeout(() => setStatus("idle"), 3000);
		} catch (error) {
			setStatus("error");
			setTimeout(() => setStatus("idle"), 4000);
		}
	};

	return (
		<section id="newsletter" className="py-60px md:py-20 lg:py-30 bg-[#09090b] relative overflow-hidden" aria-labelledby="newsletter-heading">
			{/* Background decoration */}
			<div className="absolute inset-0 opacity-15" aria-hidden="true">
				<div className="absolute top-10 left-10 w-[300px] h-[300px] bg-[#00ff41] rounded-full blur-[150px]"></div>
				<div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#00aaff] rounded-full blur-[180px]"></div>
			</div>

			<div className="container relative z-10">
				<div className="max-w-3xl mx-auto text-center">
					<span className="section-badge mb-6 inline-flex">
						<i className="fa-solid fa-terminal text-xs" aria-hidden="true"></i>
						newsletter
					</span>

					<h2 id="newsletter-heading" className="text-[26px] md:text-[32px] lg:text-[40px] font-bold leading-[1.1] mb-6 tracking-[-0.03em]">
						<span className="gradient-text">Stay Updated</span>{" "}
						<span className="text-white">on DevOps & AI</span>
					</h2>

					<p className="text-white/40 text-base leading-1.7 mb-10 max-w-xl mx-auto">
						Get insights on cloud infrastructure, Kubernetes, AI/ML ops, and the future of
						Linux DevOps Engineering. No spam, just valuable content.
					</p>

					<form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto px-4 sm:px-0" aria-label="Newsletter subscription">
						<div className="flex-1 relative">
							<label htmlFor="newsletter-email" className="sr-only">Email address</label>
							<input
								id="newsletter-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="root@your-email.com"
								className="w-full px-5 py-3.5 rounded-xl bg-[#111113]/80 backdrop-blur-sm border border-[#00ff41]/20 text-[#00ff41] placeholder-[#00ff41]/40 focus:outline-none focus:border-[#00ff41]/60 focus:shadow-[0_0_20px_rgba(0,255,65,0.1)] transition-all duration-300 font-mono text-sm"
								disabled={status === "loading" || status === "success"}
								required
								aria-describedby="newsletter-hint"
							/>
						</div>
						<button
							type="submit"
							disabled={status === "loading" || status === "success"}
							className="px-6 py-3.5 bg-gradient-to-r from-[#00ff41] to-[#00cc88] text-[#09090b] font-bold rounded-xl hover:shadow-[0_0_30px_rgba(0,255,65,0.4)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 font-mono sm:w-auto text-sm"
						>
							{status === "loading" ? (
								<>
									<i className="fa-solid fa-spinner animate-spin" aria-hidden="true"></i>
									<span>Processing...</span>
								</>
							) : status === "success" ? (
								<>
									<i className="fa-solid fa-check" aria-hidden="true"></i>
									<span>Subscribed!</span>
								</>
							) : (
								<>
									<span>Subscribe</span>
									<i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
								</>
							)}
						</button>
					</form>

					<p id="newsletter-hint" className="text-[#00ff41]/40 text-xs mt-6 font-mono">
						{status === "error"
							? "Subscription failed. Please try again or use the contact form."
							: "Join 500+ DevOps professionals. Unsubscribe anytime."}
					</p>

					{/* Status announcement for screen readers */}
					<div aria-live="polite" className="sr-only">
						{status === "success" && "Successfully subscribed to the newsletter."}
						{status === "loading" && "Processing your subscription..."}
						{status === "error" && "Subscription failed."}
					</div>

					{/* Social proof */}
					<div className="mt-12 flex items-center justify-center">
						<div className="flex flex-col sm:flex-row items-center gap-3">
							<div className="flex -space-x-2" aria-hidden="true">
								<div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00ff41]/20 to-[#00aaff]/10 border border-[#00ff41]/30 flex items-center justify-center text-[#00ff41] text-xs font-mono">AK</div>
								<div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00aaff]/20 to-[#00ff41]/10 border border-[#00ff41]/30 flex items-center justify-center text-[#00ff41] text-xs font-mono">JD</div>
								<div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00cc88]/20 to-[#00ff41]/10 border border-[#00ff41]/30 flex items-center justify-center text-[#00ff41] text-xs font-mono">SR</div>
							</div>
							<span className="text-white/35 text-xs font-mono text-center">Trusted by SREs worldwide</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Newsletter;
