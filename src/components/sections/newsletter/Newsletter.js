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
			<div className="absolute inset-0 opacity-10" aria-hidden="true">
				<div className="absolute top-10 left-10 w-[300px] h-[300px] bg-[#10b981] rounded-full blur-[150px]"></div>
				<div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#38bdf8] rounded-full blur-[180px]"></div>
			</div>

			<div className="container relative z-10">
				<div className="max-w-3xl mx-auto text-center">
					<span className="section-badge mb-6 inline-flex">Newsletter</span>

					<h2 id="newsletter-heading" className="text-[26px] md:text-[30px] lg:text-[34px] font-semibold leading-[1.1] mb-6 tracking-[-0.02em] text-white">
						Notes from{" "}
						<span className="gradient-text">production.</span>
					</h2>

					<p className="text-white/45 text-base leading-[1.75] mb-10 max-w-xl mx-auto">
						Occasional, practical writing on Kubernetes, cloud infrastructure, and
						where AI is changing operations. No fluff, no spam — unsubscribe anytime.
					</p>

					<form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto px-4 sm:px-0" aria-label="Newsletter subscription">
						<div className="flex-1 relative">
							<label htmlFor="newsletter-email" className="sr-only">Email address</label>
							<input
								id="newsletter-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@company.com"
								className="w-full px-5 py-3.5 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#10b981]/50 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)] transition-all duration-300 text-sm"
								disabled={status === "loading" || status === "success"}
								required
								aria-describedby="newsletter-hint"
							/>
						</div>
						<button
							type="submit"
							disabled={status === "loading" || status === "success"}
							className="px-6 py-3.5 bg-[#10b981] hover:bg-[#34d399] text-[#022c22] font-semibold rounded-xl hover:shadow-[0_0_28px_rgba(16,185,129,0.35)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 sm:w-auto text-sm"
						>
							{status === "loading" ? (
								<>
									<i className="fa-solid fa-spinner animate-spin" aria-hidden="true"></i>
									<span>Subscribing…</span>
								</>
							) : status === "success" ? (
								<>
									<i className="fa-solid fa-check" aria-hidden="true"></i>
									<span>Subscribed</span>
								</>
							) : (
								<>
									<span>Subscribe</span>
									<i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
								</>
							)}
						</button>
					</form>

					<p id="newsletter-hint" className="text-white/50 text-xs mt-6 font-mono">
						{status === "error"
							? "Subscription failed — please try again, or use the contact form below."
							: "Read by DevOps and SRE folks worldwide."}
					</p>

					{/* Status announcement for screen readers */}
					<div aria-live="polite" className="sr-only">
						{status === "success" && "Successfully subscribed to the newsletter."}
						{status === "loading" && "Processing your subscription..."}
						{status === "error" && "Subscription failed."}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Newsletter;
