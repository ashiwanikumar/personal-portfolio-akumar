"use client";

import { useState } from "react";
import Link from "next/link";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";

const SkillCard = ({ skill }) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className="glass-card rounded-2xl p-5 text-center group"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={{
				borderColor: isHovered ? `${skill.color}30` : undefined,
				boxShadow: isHovered ? `0 8px 40px ${skill.color}15` : undefined,
			}}
			role="listitem"
		>
			<div
				className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center transition-all duration-500"
				style={{
					backgroundColor: isHovered ? `${skill.color}15` : 'rgba(255,255,255,0.04)',
					transform: isHovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
				}}
				aria-hidden="true"
			>
				<i
					className={`${skill.icon} text-xl transition-all duration-500`}
					style={{ color: isHovered ? skill.color : 'rgba(255,255,255,0.5)' }}
				></i>
			</div>
			<div className="font-semibold text-sm mb-1 text-white/80 group-hover:text-white transition-colors duration-300">
				{skill.name}
			</div>
			<div className="text-white/50 text-xs font-mono">
				{skill.desc}
			</div>
		</div>
	);
};

const certifications = ["AZ-104", "AZ-400", "AWS SAA", "RHCSA", "RHCE", "CCNA", "JNCIA-Cloud", "JNCIA-SEC", "JNCIA-Junos"];

const facts = [
	{ label: "Based in", value: "Abu Dhabi, UAE" },
	{ label: "Originally from", value: "India" },
	{ label: "Current role", value: "Linux DevOps Engineer at Astek Middle East (client: Idemia), since Jan 2024" },
	{ label: "Before that", value: "System Engineer at NMC, CoreHive Computing and Dilip Buildcon, 2018 to 2024" },
	{ label: "Languages", value: "English, Hindi" },
];

// isPage: rendered as the /about page (h1 + extra background block) rather
// than as a section on the home page (h2).
const About5 = ({ isPage = false }) => {
	const Heading = isPage ? "h1" : "h2";
	const SubHeading = isPage ? "h2" : "h3";

	const skills = [
		{ icon: "fa-brands fa-aws", name: "AWS", desc: "Cloud Platform", color: "#FF9900" },
		{ icon: "fa-brands fa-docker", name: "Docker", desc: "Containerization", color: "#2496ED" },
		{ icon: "fa-solid fa-dharmachakra", name: "Kubernetes", desc: "Orchestration", color: "#326CE5" },
		{ icon: "fa-brands fa-redhat", name: "OpenShift", desc: "Enterprise K8s", color: "#EE0000" },
		{ icon: "fa-solid fa-code-branch", name: "Terraform", desc: "IaC", color: "#7B42BC" },
		{ icon: "fa-solid fa-gears", name: "Ansible", desc: "Automation", color: "#EE0000" },
		{ icon: "fa-brands fa-microsoft", name: "Azure DevOps", desc: "CI/CD Platform", color: "#0078D4" },
		{ icon: "fa-solid fa-chart-area", name: "Prometheus", desc: "Monitoring", color: "#E6522C" },
	];

	const stats = [
		{ value: "7+", label: "Years in production", icon: "fa-solid fa-calendar-check" },
		{ value: "99.9%", label: "Uptime maintained", icon: "fa-solid fa-chart-line" },
		{ value: "500+", label: "Servers managed", icon: "fa-solid fa-server" },
		{ value: "5", label: "UAE airports", icon: "fa-solid fa-plane-departure" },
	];

	return (
		<section id="about" aria-labelledby="about-heading">
			<div className={`${isPage ? "pt-8 md:pt-12 pb-20 md:pb-28" : "py-20 md:py-28 lg:py-36"} relative overflow-hidden`}>
				<div className="mesh-gradient" aria-hidden="true" />

				<div className="container relative z-10">
					<div className="text-center mb-16">
						<span className="section-badge mb-6 inline-flex">About</span>
						<Heading id="about-heading" className="text-[26px] md:text-[30px] lg:text-[34px] xl:text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] mb-6 text-white">
							Good infrastructure is the kind{" "}
							<span className="gradient-text">nobody talks about.</span>
						</Heading>
						<p className="text-white/50 max-w-2xl mx-auto text-[15px] leading-[1.75]">
							I&apos;ve spent seven years on systems people only notice when they break:
							airport infrastructure, hospital platforms, telecom networks. Right now I work
							on the UAE ICP programme, keeping five UAE airports at 99.9% uptime for more
							than 50 million passengers a year. I&apos;m originally from India and now live
							in Abu Dhabi.
						</p>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-16 max-w-4xl mx-auto">
						{stats.map((stat, idx) => (
							<div key={idx} className="glass-card rounded-2xl p-6 text-center group">
								<div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover:bg-[#10b981]/10 transition-all duration-300" aria-hidden="true">
									<i className={`${stat.icon} text-white/30 group-hover:text-[#34d399] text-sm transition-colors duration-300`}></i>
								</div>
								<div className="text-2xl md:text-3xl font-semibold text-white mb-1 tracking-[-0.02em]">
									{stat.value}
								</div>
								<div className="text-white/50 text-xs font-mono">
									{stat.label}
								</div>
							</div>
						))}
					</div>

					{/* Skills */}
					<div className="mb-16">
						<SubHeading className="text-center text-xs font-medium text-white/50 mb-8 uppercase tracking-[0.2em] font-mono">
							The stack I work in every day
						</SubHeading>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto" role="list" aria-label="Technical skills">
							{skills.map((skill, idx) => (
								<SkillCard key={idx} skill={skill} />
							))}
						</div>
					</div>

					{/* Info Cards */}
					<div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-14">
						{[
							{ icon: "fa-solid fa-heart", title: "Built on open source", desc: "Almost everything I run is open source: Linux, Kubernetes, Terraform, Ansible. It's what I learned on, and it's what I trust in production." },
							{ icon: "fa-solid fa-plane", title: "Airport systems", desc: "Infrastructure for five UAE airports on the ICP programme, including Abu Dhabi and Sharjah, plus Muscat International in Oman. There's never a good time for an airport to go offline." },
						].map((card) => (
							<div key={card.title} className="glass-card rounded-2xl p-8 group">
								<div className="flex items-start gap-5">
									<div className="w-12 h-12 bg-white/[0.04] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#10b981]/10 transition-all duration-300" aria-hidden="true">
										<i className={`${card.icon} text-white/30 group-hover:text-[#34d399] transition-colors duration-300`}></i>
									</div>
									<div>
										<SubHeading className="text-white font-semibold text-base mb-2 tracking-[-0.01em]">{card.title}</SubHeading>
										<p className="text-white/45 text-sm leading-relaxed">{card.desc}</p>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Background (about page only) */}
					{isPage && (
						<div className="glass-card rounded-2xl p-6 md:p-8 max-w-4xl mx-auto mb-14">
							<SubHeading className="text-xs font-medium text-white/50 mb-6 uppercase tracking-[0.2em] font-mono">
								Background
							</SubHeading>
							<dl className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-[160px_1fr] sm:gap-x-6 sm:gap-y-4 text-sm">
								{facts.map((fact) => (
									<div key={fact.label} className="sm:contents">
										<dt className="text-white/50 font-mono text-xs mb-1 sm:mb-0 sm:pt-0.5">{fact.label}</dt>
										<dd className="text-white/80 leading-relaxed">{fact.value}</dd>
									</div>
								))}
							</dl>
							<div className="mt-8 pt-6 border-t border-white/[0.08]">
								<h3 className="text-white/50 font-mono text-xs mb-3">Certifications</h3>
								<ul className="flex flex-wrap gap-2">
									{certifications.map((cert) => (
										<li
											key={cert}
											className="px-3 py-1.5 text-xs font-mono bg-white/[0.04] text-white/70 border border-white/10 rounded-full"
										>
											{cert}
										</li>
									))}
								</ul>
							</div>
							<Link
								href="/resume"
								className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-[#34d399] hover:text-[#10b981] transition-colors duration-300 group"
							>
								Full work history on my resume
								<i className="fa-solid fa-arrow-right text-xs transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true"></i>
							</Link>
						</div>
					)}

					{/* CTA */}
					<div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
						<ButtonPrimary isIcon={true} href="/#contact">Work with me</ButtonPrimary>
						<a
							className="inline-flex items-center justify-center px-5 py-2.5 text-white/60 hover:text-white bg-transparent border border-white/10 hover:border-white/25 rounded-lg transition-all duration-300 text-sm font-medium group"
							href="https://www.linkedin.com/in/ashiwanikumar/"
							target="_blank"
							rel="noopener noreferrer"
						>
							<i className="fa-brands fa-linkedin mr-2" aria-hidden="true"></i>
							Connect on LinkedIn
							<span className="sr-only"> (opens in a new tab)</span>
						</a>
					</div>
				</div>
			</div>
		</section>
	);
};

export default About5;
