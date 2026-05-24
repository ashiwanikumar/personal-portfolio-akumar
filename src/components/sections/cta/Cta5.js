"use client";

import { useState } from "react";
import TypeWriterLoop from "@/components/shared/others/TypeWriterLoop";

const Cta5 = () => {
	const [form, setForm] = useState({
		name: "",
		email: "",
		category: "devops-consulting",
		message: "",
	});
	const [status, setStatus] = useState("idle");
	const [feedback, setFeedback] = useState("");

	const phrases = [
		"Ready to Scale Your Infrastructure?",
		"Need 99.9% Uptime for Your Systems?",
		"Want to Automate Your Cloud?",
		"Looking for DevOps Excellence?",
		"Ready to Build CI/CD Pipelines?",
	];

	const categories = [
		{ id: "devops-consulting", name: "DevOps Consulting" },
		{ id: "cloud-infrastructure", name: "Cloud Infrastructure" },
		{ id: "kubernetes", name: "Kubernetes / OpenShift" },
		{ id: "ci-cd", name: "CI/CD Automation" },
		{ id: "other", name: "Other" },
	];

	const handleChange = (event) => {
		const { name, value } = event.target;
		setForm((current) => ({ ...current, [name]: value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setStatus("loading");
		setFeedback("");

		const selectedCategory = categories.find((category) => category.id === form.category);

		try {
			const response = await fetch("/api/public/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: form.name,
					email: form.email,
					message: form.message,
					category: selectedCategory,
					deviceInfo: {
						screenWidth: typeof window !== "undefined" ? window.innerWidth : undefined,
						screenHeight: typeof window !== "undefined" ? window.innerHeight : undefined,
						timezone:
							typeof Intl !== "undefined"
								? Intl.DateTimeFormat().resolvedOptions().timeZone
								: undefined,
					},
				}),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.message || "Contact submission failed");

			setStatus("success");
			setFeedback(data.message || "Message submitted successfully.");
			setForm({ name: "", email: "", category: "devops-consulting", message: "" });
		} catch (error) {
			setStatus("error");
			setFeedback(error.message || "Unable to submit the contact form.");
		}
	};

	return (
		<section id="contact" aria-labelledby="cta-heading">
			<div className="container py-20 md:py-28">
				<div className="glass-card py-16 px-6 sm:py-20 lg:px-16 lg:py-24 rounded-[32px] relative z-0 overflow-hidden">
					{/* Background glow */}
					<div className="absolute inset-0 opacity-20" aria-hidden="true">
						<div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#00ff41] rounded-full blur-[150px]"></div>
						<div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-[#00aaff] rounded-full blur-[160px]"></div>
					</div>

					<div className="text-center relative z-10">
						<span className="section-badge mb-8 inline-flex">Let&apos;s Connect</span>

						<div className="min-h-[80px] md:min-h-[110px] lg:min-h-[140px] flex items-center justify-center mb-8">
							<h2 id="cta-heading" className="text-[24px] sm:text-[30px] md:text-[36px] lg:text-[44px] xl:text-[50px] tracking-[-0.03em] leading-[1.1] font-bold uppercase">
								<span className="gradient-text">
									<TypeWriterLoop
										phrases={phrases}
										typeSpeed={60}
										deleteSpeed={30}
										pauseTime={2500}
									/>
								</span>
							</h2>
						</div>

						<p className="text-white/40 text-[16px] lg:text-[17px] max-w-2xl mx-auto mb-12 leading-[1.8]">
							With 7+ years of DevOps experience, I can help automate your cloud infrastructure,
							build robust CI/CD pipelines, and ensure 99.9% uptime for your critical systems.
						</p>

						<form
							onSubmit={handleSubmit}
							className="mx-auto mb-14 grid max-w-3xl gap-4 text-left"
							aria-label="Contact form"
						>
							<div className="grid gap-4 md:grid-cols-2">
								<label className="text-sm font-semibold text-white/60">
									Name
									<input
										name="name"
										value={form.name}
										onChange={handleChange}
										className="mt-2 w-full rounded-xl border border-[#00ff41]/20 bg-[#111113]/80 px-4 py-3 text-sm text-[#00ff41] outline-none transition-all duration-300 placeholder:text-[#00ff41]/35 focus:border-[#00ff41]/60"
										placeholder="Your name"
										required
									/>
								</label>
								<label className="text-sm font-semibold text-white/60">
									Email
									<input
										name="email"
										type="email"
										value={form.email}
										onChange={handleChange}
										className="mt-2 w-full rounded-xl border border-[#00ff41]/20 bg-[#111113]/80 px-4 py-3 text-sm text-[#00ff41] outline-none transition-all duration-300 placeholder:text-[#00ff41]/35 focus:border-[#00ff41]/60"
										placeholder="you@example.com"
										required
									/>
								</label>
							</div>

							<label className="text-sm font-semibold text-white/60">
								Category
								<select
									name="category"
									value={form.category}
									onChange={handleChange}
									className="mt-2 w-full rounded-xl border border-[#00ff41]/20 bg-[#111113]/80 px-4 py-3 text-sm text-[#00ff41] outline-none transition-all duration-300 focus:border-[#00ff41]/60"
								>
									{categories.map((category) => (
										<option key={category.id} value={category.id}>
											{category.name}
										</option>
									))}
								</select>
							</label>

							<div>
								<label className="text-sm font-semibold text-white/60">
									Message
									<textarea
										name="message"
										value={form.message}
										onChange={handleChange}
										rows={5}
										maxLength={5000}
										className="mt-2 w-full resize-none rounded-xl border border-[#00ff41]/20 bg-[#111113]/80 px-4 py-3 text-sm text-[#00ff41] outline-none transition-all duration-300 placeholder:text-[#00ff41]/35 focus:border-[#00ff41]/60"
										placeholder="Tell me what you need help with..."
										required
									/>
								</label>
								<span className="mt-1 block text-right text-xs text-white/30">
									{form.message.length}/5000
								</span>
							</div>

							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<button
									type="submit"
									disabled={status === "loading"}
									className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00ff41] to-[#00cc88] px-8 py-4 text-sm font-bold text-[#09090b] transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,255,65,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
								>
									<i
										className={`fa-solid ${
											status === "loading" ? "fa-spinner animate-spin" : "fa-paper-plane"
										}`}
										aria-hidden="true"
									></i>
									{status === "loading" ? "Submitting..." : "Submit Request"}
								</button>
								<a
									href="https://www.linkedin.com/in/ashiwanikumar/"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-8 py-4 text-sm font-bold text-white/60 transition-all duration-300 hover:border-[#00ff41]/30 hover:text-[#00ff41]"
									aria-label="Connect on LinkedIn"
								>
									<i className="fa-brands fa-linkedin" aria-hidden="true"></i>
									LinkedIn
								</a>
							</div>

							{feedback ? (
								<p
									className={`rounded-xl border px-4 py-3 text-sm ${
										status === "success"
											? "border-[#00ff41]/25 bg-[#00ff41]/10 text-[#00ff41]"
											: "border-red-400/25 bg-red-400/10 text-red-200"
									}`}
									aria-live="polite"
								>
									{feedback}
								</p>
							) : null}
						</form>

						<div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-white/30 text-sm">
							<span className="flex items-center gap-2">
								<i className="fa-solid fa-location-dot text-[#00ff41]/40" aria-hidden="true"></i>
								Abu Dhabi, UAE
							</span>
							<span className="hidden sm:block w-1 h-1 bg-white/15 rounded-full" aria-hidden="true"></span>
							<span className="flex items-center gap-2">
								<i className="fa-solid fa-phone text-[#00ff41]/40" aria-hidden="true"></i>
								+971-566182303
							</span>
							<span className="hidden sm:block w-1 h-1 bg-white/15 rounded-full" aria-hidden="true"></span>
							<span className="flex items-center gap-2">
								<i className="fa-solid fa-envelope text-[#00ff41]/40" aria-hidden="true"></i>
								ashvanikumar109@gmail.com
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Cta5;
