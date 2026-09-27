"use client";

import { useRef, useState } from "react";
import TypeWriterLoop from "@/components/shared/others/TypeWriterLoop";

// Module scope so the arrays keep the same identity between renders. Defined
// inside the component, every keystroke in the form restarted the typewriter.
const PHRASES = [
	"Need infrastructure that scales?",
	"Tired of 3am pages?",
	"Migrating to the cloud?",
	"Want pipelines that just work?",
	"Chasing 99.9% uptime?",
];

const CATEGORIES = [
	{ id: "devops-consulting", name: "DevOps Consulting" },
	{ id: "cloud-infrastructure", name: "Cloud Infrastructure" },
	{ id: "kubernetes", name: "Kubernetes / OpenShift" },
	{ id: "ci-cd", name: "CI/CD Automation" },
	{ id: "other", name: "Other" },
];

const LIMITS = { name: 100, email: 254, message: 5000 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_EMAIL = "ashvanikumar109@gmail.com";
const FIELD_ORDER = ["name", "email", "message"];

const EMPTY_FORM = { name: "", email: "", category: "devops-consulting", message: "" };

function validate(form) {
	const errors = {};
	const name = form.name.trim();
	const email = form.email.trim();
	const message = form.message.trim();

	if (!name) errors.name = "Please enter your name.";
	else if (name.length > LIMITS.name) errors.name = `Keep your name under ${LIMITS.name} characters.`;

	if (!email) errors.email = "Please enter your email so I can reply.";
	else if (!EMAIL_PATTERN.test(email) || email.length > LIMITS.email)
		errors.email = "That email address doesn't look right.";

	if (!message) errors.message = "Please write a short message.";
	else if (message.length > LIMITS.message)
		errors.message = `Messages can be up to ${LIMITS.message} characters.`;

	return errors;
}

const Cta5 = ({ headingLevel = "h2" }) => {
	const Heading = headingLevel;
	const [form, setForm] = useState(EMPTY_FORM);
	const [errors, setErrors] = useState({});
	const [status, setStatus] = useState("idle");
	const [feedback, setFeedback] = useState("");
	const submittingRef = useRef(false);
	const fieldRefs = { name: useRef(null), email: useRef(null), message: useRef(null) };

	const handleChange = (event) => {
		const { name, value } = event.target;
		setForm((current) => ({ ...current, [name]: value }));
		if (errors[name]) {
			setErrors((current) => {
				const next = { ...current };
				delete next[name];
				return next;
			});
		}
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		// A ref, not state, so a fast double click or double Enter can't slip a
		// second request in before React re-renders the disabled button.
		if (submittingRef.current) return;

		const validationErrors = validate(form);
		setErrors(validationErrors);
		const firstInvalid = FIELD_ORDER.find((field) => validationErrors[field]);
		if (firstInvalid) {
			setStatus("idle");
			setFeedback("");
			fieldRefs[firstInvalid].current?.focus();
			return;
		}

		submittingRef.current = true;
		setStatus("loading");
		setFeedback("");

		const selectedCategory = CATEGORIES.find((category) => category.id === form.category);
		const email = form.email.trim();

		try {
			const response = await fetch("/api/public/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: form.name.trim(),
					email,
					message: form.message.trim(),
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
			// A proxy or gateway error can come back as HTML, not JSON.
			const data = await response.json().catch(() => null);
			if (!response.ok) {
				const serverMessage =
					response.status < 500 && typeof data?.message === "string" ? data.message : "";
				throw new Error(serverMessage);
			}

			setStatus("success");
			setFeedback(`Thanks, got it. I'll reply to ${email}, usually within a day.`);
			setForm(EMPTY_FORM);
			setErrors({});
		} catch (error) {
			setStatus("error");
			setFeedback(
				error.message ||
					`Your message didn't go through. Please try again, or email me at ${CONTACT_EMAIL}.`
			);
		} finally {
			submittingRef.current = false;
		}
	};

	const inputClasses =
		"mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/30 focus:border-[#10b981]/50 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)] aria-[invalid=true]:border-red-400/50";

	const fieldProps = (name) => ({
		id: `contact-${name}`,
		name,
		ref: fieldRefs[name],
		value: form[name],
		onChange: handleChange,
		required: true,
		"aria-required": "true",
		"aria-invalid": errors[name] ? "true" : undefined,
	});

	const fieldError = (name) =>
		errors[name] ? (
			<span id={`contact-${name}-error`} className="mt-1.5 block text-xs text-red-300">
				{errors[name]}
			</span>
		) : null;

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
							<Heading id="cta-heading" className="text-[20px] sm:text-[24px] md:text-[26px] lg:text-[28px] tracking-[-0.02em] leading-[1.15] font-semibold text-white">
								{/* Screen readers get this stable heading; the typewriter is visual only. */}
								<span className="sr-only">Get in touch</span>
								<TypeWriterLoop
									phrases={PHRASES}
									typeSpeed={60}
									deleteSpeed={30}
									pauseTime={2500}
									textClassName="gradient-text"
								/>
							</Heading>
						</div>

						<p className="text-white/45 text-[15px] max-w-xl mx-auto mb-8 leading-[1.75]">
							Tell me what you&apos;re building and where it hurts. I&apos;ll tell you
							honestly whether I can help. I usually reply within a day.
						</p>

						<form
							onSubmit={handleSubmit}
							noValidate
							className="mx-auto mb-8 grid max-w-2xl gap-3.5 text-left"
							aria-label="Contact form"
						>
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<label htmlFor="contact-name" className="text-sm font-medium text-white/60">
										Name
									</label>
									<input
										{...fieldProps("name")}
										type="text"
										autoComplete="name"
										maxLength={LIMITS.name}
										aria-describedby={errors.name ? "contact-name-error" : undefined}
										className={inputClasses}
										placeholder="Your name"
									/>
									{fieldError("name")}
								</div>
								<div>
									<label htmlFor="contact-email" className="text-sm font-medium text-white/60">
										Email
									</label>
									<input
										{...fieldProps("email")}
										type="email"
										inputMode="email"
										autoComplete="email"
										spellCheck={false}
										maxLength={LIMITS.email}
										aria-describedby={errors.email ? "contact-email-error" : undefined}
										className={inputClasses}
										placeholder="you@company.com"
									/>
									{fieldError("email")}
								</div>
							</div>

							<div>
								<label htmlFor="contact-category" className="text-sm font-medium text-white/60">
									What do you need?
								</label>
								<span className="relative block">
									<select
										id="contact-category"
										name="category"
										value={form.category}
										onChange={handleChange}
										className={`${inputClasses} appearance-none cursor-pointer bg-[#111113] pr-10`}
									>
										{CATEGORIES.map((category) => (
											<option key={category.id} value={category.id}>
												{category.name}
											</option>
										))}
									</select>
									<i className="fa-solid fa-chevron-down pointer-events-none absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-xs text-white/40" aria-hidden="true"></i>
								</span>
							</div>

							<div>
								<label htmlFor="contact-message" className="text-sm font-medium text-white/60">
									Message
								</label>
								<textarea
									{...fieldProps("message")}
									rows={4}
									maxLength={LIMITS.message}
									aria-describedby={`contact-message-count${errors.message ? " contact-message-error" : ""}`}
									className={`${inputClasses} resize-none`}
									placeholder="Tell me about your infrastructure, your team, and what's not working…"
								/>
								<div className="mt-1 flex items-start justify-between gap-3">
									<span className="min-w-0">{fieldError("message")}</span>
									<span
										id="contact-message-count"
										className="shrink-0 text-right text-xs text-white/50 font-mono"
									>
										{form.message.length}/{LIMITS.message}
										<span className="sr-only"> characters</span>
									</span>
								</div>
							</div>

							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<button
									type="submit"
									disabled={status === "loading"}
									aria-busy={status === "loading"}
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
								>
									<i className="fa-brands fa-linkedin" aria-hidden="true"></i>
									LinkedIn
									<span className="sr-only"> (opens in a new tab)</span>
								</a>
							</div>

							{/* Always mounted so screen readers pick up the message when it appears. */}
							<div aria-live="polite" aria-atomic="true">
								{feedback ? (
									<p
										className={`rounded-xl border px-4 py-3 text-sm ${
											status === "success"
												? "border-[#10b981]/25 bg-[#10b981]/10 text-[#34d399]"
												: "border-red-400/25 bg-red-400/10 text-red-200"
										}`}
									>
										{feedback}
									</p>
								) : null}
							</div>
						</form>

						<address className="not-italic flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-y-3 text-white/55 text-sm font-mono">
							<span className="flex items-center gap-2">
								<i className="fa-solid fa-location-dot text-[#34d399]/50" aria-hidden="true"></i>
								Abu Dhabi, UAE
							</span>
							<a href="tel:+971566182303" className="flex items-center gap-2 transition-colors duration-300 hover:text-[#34d399]">
								<i className="fa-solid fa-phone text-[#34d399]/50" aria-hidden="true"></i>
								<span className="sr-only">UAE phone: </span>
								+971 566182303
							</a>
							<a href="tel:+918770616837" className="flex items-center gap-2 transition-colors duration-300 hover:text-[#34d399]">
								<i className="fa-solid fa-phone text-[#34d399]/50" aria-hidden="true"></i>
								<span className="sr-only">India phone: </span>
								+91 8770616837
							</a>
							<a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 transition-colors duration-300 hover:text-[#34d399]">
								<i className="fa-solid fa-envelope text-[#34d399]/50" aria-hidden="true"></i>
								{CONTACT_EMAIL}
							</a>
						</address>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Cta5;
