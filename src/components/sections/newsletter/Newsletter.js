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
		<section id="newsletter" className="py-60px md:py-20 lg:py-30 bg-gradient-to-br from-primary-color via-purple-600 to-indigo-700 relative overflow-hidden">
			{/* Background decoration */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
				<div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full blur-3xl"></div>
			</div>

			<div className="container relative z-10">
				<div className="max-w-3xl mx-auto text-center">
					<div className="mb-6">
						<span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm">
							<i className="fa-solid fa-envelope"></i>
							Newsletter
						</span>
					</div>

					<h2 className="text-3xl md:text-size-40 lg:text-size-50 font-semibold leading-1.2 text-white mb-6">
						Stay Updated on DevOps & AI
					</h2>

					<p className="text-white/80 text-lg leading-1.5 mb-10 max-w-xl mx-auto">
						Get insights on cloud infrastructure, Kubernetes, AI/ML ops, and the future of
						Site Reliability Engineering. No spam, just valuable content.
					</p>

					<form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
						<div className="flex-1 relative">
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your email"
								className="w-full px-6 py-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
								disabled={status === "loading" || status === "success"}
							/>
						</div>
						<button
							type="submit"
							disabled={status === "loading" || status === "success"}
							className="px-8 py-4 bg-white text-primary-color font-semibold rounded-full hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
						>
							{status === "loading" ? (
								<>
									<i className="fa-solid fa-spinner animate-spin"></i>
									Subscribing...
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

					<p className="text-white/60 text-sm mt-6">
						Join 500+ DevOps professionals. Unsubscribe anytime.
					</p>

					{/* Social proof */}
					<div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
						<div className="flex items-center gap-3">
							<div className="flex -space-x-2">
								<div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-medium">AK</div>
								<div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white text-sm font-medium">JD</div>
								<div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-medium">SR</div>
							</div>
							<span className="text-white/80 text-sm">Trusted by SREs worldwide</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Newsletter;
