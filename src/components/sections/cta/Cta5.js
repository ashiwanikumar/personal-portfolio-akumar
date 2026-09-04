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
		"Need infrastructure that scales?",
		"Tired of 3am pages?",
		"Migrating to the cloud?",
		"Want pipelines that just work?",
		"Chasing 99.9% uptime?",
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

	const inputClasses =
		"mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/30 focus:border-[#10b981]/50 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]";

	return (
		<section id="contact" aria-labelledby="cta-heading">
			<div className="container py-12 md:py-16">
				<div className="glass-card max-w-4xl mx-auto py-10 px-6 sm:py-12 lg:px-12 rounded-3xl relative z-0 overflow-hidden">
					{/* Background glow */}
					<div className="absolute inset-0 opacity-15" aria-hidden="true">
						<div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#10b981] rounded-full blur-[150px]"></div>
						<div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-[#38bdf8] rounded-full blur-[160px]"></div>
					</div>

					<div className="text-center relative z-10">
						<span className="section-badge mb-5 inline-flex">Contact</span>

						<div className="min-h-[40px] md:min-h-[48px] flex items-center justify-center mb-3">
							<h2 id="cta-heading" className="text-[20px] sm:text-[24px] md:text-[26px] lg:text-[28px] tracking-[-0.02em] leading-[1.15] font-semibold text-white">
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

						<p className="text-white/45 text-[15px] max-w-xl mx-auto mb-8 leading-[1.75]">
							Tell me what you&apos;re building and where it hurts. I&apos;ll reply with an
							honest take on whether I can help — usually within a day.
						</p>

						<form
							onSubmit={handleSubmit}
							className="mx-auto mb-8 grid max-w-2xl gap-3.5 text-left"
							aria-label="Contact form"
						>
							<div className="grid gap-4 md:grid-cols-2">
								<label className="text-sm font-medium text-white/60">
									Name
									<input
										name="name"
										value={form.name}
										onChange={handleChange}
										className={inputClasses}
										placeholder="Your name"
										required
									/>
								</label>
								<label className="text-sm font-medium text-white/60">
									Email
									<input
										name="email"
										type="email"
										value={form.email}
										onChange={handleChange}
										className={inputClasses}
										placeholder="you@company.com"
										required
									/>
								</label>
							</div>

							<label className="text-sm font-medium text-white/60">
								What do you need?
								<span className="relative block">
									<select
										name="category"
										value={form.category}
										onChange={handleChange}
										className={`${inputClasses} appearance-none cursor-pointer bg-[#111113] pr-10`}
									>
										{categories.map((category) => (
											<option key={category.id} value={category.id}>
												{category.name}
											</option>
										))}
									</select>
									<i className="fa-solid fa-chevron-down pointer-events-none absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-xs text-white/40" aria-hidden="true"></i>
								</span>
							</label>

							<div>
								<label className="text-sm font-medium text-white/60">
									Message
									<textarea
										name="message"
										value={form.message}
										onChange={handleChange}
										rows={4}
										maxLength={5000}
										className={`${inputClasses} resize-none`}
										placeholder="Tell me about your infrastructure, your team, and what's not working…"
										required
									/>
								</label>
								<span className="mt-1 block text-right text-xs text-white/50 font-mono">
									{form.message.length}/5000
								</span>
							</div>

							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<button
									type="submit"
									disabled={status === "loading"}
									className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10b981] hover:bg-[#34d399] px-6 py-3 text-sm font-medium text-[#022c22] transition-all duration-300 hover:shadow-[0_0_32px_rgba(16,185,129,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
								>
									<i
										className={`fa-solid ${
											status === "loading" ? "fa-spinner animate-spin" : "fa-paper-plane"
										}`}
										aria-hidden="true"
									></i>
									{status === "loading" ? "Sending…" : "Send message"}
								</button>
								<a
									href="https://www.linkedin.com/in/ashiwanikumar/"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-transparent px-6 py-3 text-sm font-medium text-white/60 transition-all duration-300 hover:border-white/25 hover:text-white"
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
											? "border-[#10b981]/25 bg-[#10b981]/10 text-[#34d399]"
											: "border-red-400/25 bg-red-400/10 text-red-200"
									}`}
									aria-live="polite"
								>
									{feedback}
								</p>
							) : null}
						</form>

						<div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-white/55 text-sm font-mono">
							<span className="flex items-center gap-2">
								<i className="fa-solid fa-location-dot text-[#34d399]/50" aria-hidden="true"></i>
								Abu Dhabi, UAE
							</span>
							<span className="hidden sm:block w-1 h-1 bg-white/15 rounded-full" aria-hidden="true"></span>
							<span className="flex items-center gap-2">
								<i className="fa-solid fa-phone text-[#34d399]/50" aria-hidden="true"></i>
								+971-566182303
							</span>
							<span className="hidden sm:block w-1 h-1 bg-white/15 rounded-full" aria-hidden="true"></span>
							<span className="flex items-center gap-2">
								<i className="fa-solid fa-envelope text-[#34d399]/50" aria-hidden="true"></i>
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
