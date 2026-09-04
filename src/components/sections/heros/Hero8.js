"use client";

import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import ShareButton from "@/components/shared/buttons/ShareButton";

const terminalLines = [
	{ prompt: true, text: "kubectl get nodes -o wide" },
	{ ok: true, text: "24/24 nodes Ready · 5 clusters · 3 regions" },
	{ prompt: true, text: "uptime --check --env production" },
	{ ok: true, text: "99.9% over the last 12 months" },
	{ prompt: true, text: "whoami" },
	{ accent: true, text: "ashiwani — Linux DevOps / SRE, Abu Dhabi" },
];

const Hero8 = () => {
	return (
		<section
			className="hero-section relative pt-170px pb-110px md:pb-30 lg:pt-220px lg:pb-5 2xl:pt-250px 2xl:pb-50px overflow-hidden"
			aria-label="Hero section"
		>
			<div className="mesh-gradient" aria-hidden="true" />

			{/* Subtle grid pattern */}
			<div
				className="absolute inset-0 opacity-[0.02] z-0"
				style={{
					backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
					backgroundSize: '80px 80px',
				}}
				aria-hidden="true"
			/>

			<div className="container relative z-10">
				<div className="grid lg:grid-cols-2 gap-y-[80px] md:gap-y-16 lg:gap-y-0 gap-x-12 items-center">
					<div className="lg:pl-30px xl:pl-15px 2xl:pl-0 text-center lg:text-left">
						<span className="section-badge mb-7 inline-flex items-center">
							<span className="relative flex h-2 w-2" aria-hidden="true">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-60"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-[#34d399]"></span>
							</span>
							Available for consulting
						</span>

						<h1 className="text-[32px] sm:text-[38px] md:text-[44px] xl:text-[50px] 2xl:text-[54px] leading-[1.12] mb-6 tracking-[-0.025em] font-semibold text-white">
							Infrastructure that
							<br />
							<span className="gradient-text">stays up.</span>
						</h1>

						<p className="text-[15px] md:text-base leading-[1.75] text-white/55 max-w-[480px] mx-auto lg:mx-0 mb-9">
							I&apos;m Ashiwani Kumar — a Linux DevOps &amp; SRE engineer with 7+ years
							running mission-critical systems. Today that means keeping five UAE
							airports online at 99.9% uptime, on Kubernetes, OpenShift, and AWS.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start justify-center lg:justify-start mb-10">
							<ButtonPrimary isIcon={true} href="/#contact">
								Start a conversation
							</ButtonPrimary>
							<a
								href="/#portfolio"
								className="inline-flex items-center gap-2 px-5 py-2.5 text-white/60 hover:text-white text-sm font-medium border border-white/10 hover:border-white/25 rounded-lg transition-all duration-300 group"
								aria-label="See my work"
							>
								See my work
								<i className="fa-solid fa-arrow-right transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true"></i>
							</a>
						</div>

						<dl className="flex items-center justify-center lg:justify-start gap-8 font-mono" aria-label="Key metrics">
							{[
								{ value: "7+", label: "years" },
								{ value: "99.9%", label: "uptime" },
								{ value: "500+", label: "servers" },
							].map((m) => (
								<div key={m.label} className="text-center lg:text-left">
									<dt className="sr-only">{m.label}</dt>
									<dd className="text-white text-lg font-semibold leading-none mb-1">{m.value}</dd>
									<dd className="text-white/50 text-[11px] uppercase tracking-[0.15em]">{m.label}</dd>
								</div>
							))}
						</dl>
					</div>

					<div className="flex items-center justify-center lg:justify-end">
						<div className="relative w-full max-w-[540px]">
							<div
								className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#10b981]/10 via-[#2dd4bf]/5 to-[#38bdf8]/10 blur-[100px] scale-90"
								aria-hidden="true"
							/>
							{/* Terminal card */}
							<div className="relative z-10 rounded-2xl border border-white/10 bg-[#0c0c0e]/90 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.55)] overflow-hidden animate-float">
								<div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
									<span className="w-3 h-3 rounded-full bg-[#ff5f57]" aria-hidden="true"></span>
									<span className="w-3 h-3 rounded-full bg-[#febc2e]" aria-hidden="true"></span>
									<span className="w-3 h-3 rounded-full bg-[#28c840]" aria-hidden="true"></span>
									<span className="ml-3 text-white/50 text-xs font-mono">ashiwani@prod: ~</span>
								</div>
								<div className="px-5 sm:px-6 py-6 font-mono text-[13px] sm:text-sm leading-[1.9]">
									{terminalLines.map((line, idx) => (
										<p key={idx} className="whitespace-nowrap overflow-hidden text-ellipsis">
											{line.prompt ? (
												<>
													<span className="text-[#34d399]">➜</span>{" "}
													<span className="text-[#38bdf8]">~</span>{" "}
													<span className="text-white/85">{line.text}</span>
												</>
											) : line.accent ? (
												<span className="text-[#34d399]">{line.text}</span>
											) : (
												<span className="text-white/45">
													<span className="text-[#34d399] mr-2">✔</span>
													{line.text}
												</span>
											)}
										</p>
									))}
									<p aria-hidden="true">
										<span className="text-[#34d399]">➜</span>{" "}
										<span className="text-[#38bdf8]">~</span>{" "}
										<span className="inline-block w-[9px] h-[17px] bg-[#34d399]/80 align-middle animate-pulse"></span>
									</p>
								</div>
							</div>
							<div className="hidden md:block absolute -top-8 -left-8 w-20 h-20 bg-[#10b981]/15 rounded-full blur-2xl animate-pulse" aria-hidden="true" />
							<div className="hidden md:block absolute -bottom-8 -right-8 w-24 h-24 bg-[#38bdf8]/10 rounded-full blur-2xl animate-pulse animation-delay-2000" aria-hidden="true" />
						</div>
					</div>
				</div>
			</div>

			<nav
				className="absolute bottom-16 sm:bottom-[85px] lg:bottom-auto lg:top-1/2 left-1/2 lg:left-[10px] 3xl:left-[50px] -translate-x-1/2 lg:translate-x-0 lg:-translate-y-1/2 z-20"
				aria-label="Social media links"
			>
				<ul className="flex flex-row lg:flex-col items-center gap-4" style={{ border: 'none', backgroundColor: 'transparent', boxShadow: 'none' }}>
					{[
						{ href: "https://github.com/ashiwanikumar", icon: "fa-brands fa-github", label: "GitHub" },
						{ href: "https://www.linkedin.com/in/ashiwanikumar/", icon: "fa-brands fa-linkedin-in", label: "LinkedIn" },
						{ href: "https://x.com/theashvanikumar", icon: "fa-brands fa-x-twitter", label: "X (Twitter)" },
						{ href: "mailto:ashvanikumar109@gmail.com", icon: "fa-solid fa-envelope", label: "Email" },
					].map((social) => (
						<li key={social.label} className="nav_item group relative">
							<a
								href={social.href}
								target={social.href.startsWith('mailto') ? undefined : "_blank"}
								rel={social.href.startsWith('mailto') ? undefined : "noopener noreferrer"}
								className="flex"
								aria-label={social.label}
							>
								<span className="text-white/40 group-hover:text-[#022c22] border border-white/10 group-hover:border-transparent w-[40px] h-[40px] rounded-full flex items-center justify-center overflow-hidden relative z-0 after:absolute after:inset-0 after:scale-0 after:bg-gradient-to-br after:from-[#10b981] after:to-[#34d399] group-hover:after:scale-100 after:transition-all after:duration-300 after:z-[-1] after:rounded-full transition-colors duration-300">
									<i className={social.icon} aria-hidden="true"></i>
								</span>
							</a>
						</li>
					))}
					<li className="nav_item group relative">
						<ShareButton isRound={true} />
					</li>
				</ul>
			</nav>
		</section>
	);
};

export default Hero8;
