"use client";

import { useState } from "react";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";

const SkillCard = ({ skill }) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className="glass-card rounded-2xl p-5 text-center cursor-pointer group"
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
			<div
				className="font-semibold text-sm mb-1 transition-all duration-300"
				style={{ color: isHovered ? skill.color : 'rgba(255,255,255,0.8)' }}
			>
				{skill.name}
			</div>
			<div className="text-white/30 text-xs">
				{skill.desc}
			</div>
		</div>
	);
};

const About5 = () => {
	const skills = [
		{ icon: "fa-brands fa-aws", name: "AWS", desc: "Cloud Platform", color: "#FF9900" },
		{ icon: "fa-brands fa-docker", name: "Docker", desc: "Containerization", color: "#2496ED" },
		{ icon: "fa-solid fa-dharmachakra", name: "Kubernetes", desc: "Orchestration", color: "#326CE5" },
		{ icon: "fa-brands fa-redhat", name: "OpenShift", desc: "Enterprise K8s", color: "#EE0000" },
		{ icon: "fa-solid fa-code-branch", name: "Terraform", desc: "IaC", color: "#7B42BC" },
		{ icon: "fa-solid fa-gears", name: "Ansible", desc: "Automation", color: "#EE0000" },
		{ icon: "fa-brands fa-microsoft", name: "Azure DevOps", desc: "CI/CD Platform", color: "#0078D4" },
	];

	const stats = [
		{ value: "7+", label: "Years Experience", icon: "fa-solid fa-calendar-check" },
		{ value: "99.9%", label: "Uptime Achieved", icon: "fa-solid fa-chart-line" },
		{ value: "500+", label: "Servers Managed", icon: "fa-solid fa-server" },
		{ value: "5", label: "UAE Airports", icon: "fa-solid fa-plane-departure" },
	];

	return (
		<section id="about" aria-labelledby="about-heading">
			<div className="py-20 md:py-28 lg:py-36 relative overflow-hidden">
				<div className="mesh-gradient" aria-hidden="true" />

				<div className="container relative z-10">
					<div className="text-center mb-16">
						<span className="section-badge mb-6 inline-flex">About Me</span>
						<h2 id="about-heading" className="text-[26px] md:text-[32px] lg:text-[38px] xl:text-[44px] uppercase font-bold leading-[1.1] tracking-[-0.03em] mb-6">
							<span className="gradient-text">Building Reliable</span>{" "}
							<span className="text-white">Infrastructure</span>
						</h2>
						<p className="text-white/45 max-w-2xl mx-auto text-[17px] leading-[1.8]">
							Linux DevOps Engineer with 7+ years of experience managing mission-critical
							infrastructure. Currently ensuring 99.9% uptime for 5 UAE airports serving 50M+
							annual passengers.
						</p>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-16 max-w-4xl mx-auto">
						{stats.map((stat, idx) => (
							<div key={idx} className="glass-card rounded-2xl p-6 text-center group">
								<div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover:bg-[#00ff41]/10 transition-all duration-300" aria-hidden="true">
									<i className={`${stat.icon} text-white/30 group-hover:text-[#00ff41] text-sm transition-colors duration-300`}></i>
								</div>
								<div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
									{stat.value}
								</div>
								<div className="text-white/35 text-xs uppercase tracking-widest">
									{stat.label}
								</div>
							</div>
						))}
					</div>

					{/* Skills */}
					<div className="mb-16">
						<h3 className="text-center text-xs font-semibold text-white/30 mb-8 uppercase tracking-[0.25em]">
							Tech Stack
						</h3>
						<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 max-w-5xl mx-auto" role="list" aria-label="Technical skills">
							{skills.map((skill, idx) => (
								<SkillCard key={idx} skill={skill} />
							))}
						</div>
					</div>

					{/* Info Cards */}
					<div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-14">
						{[
							{ icon: "fa-solid fa-heart", title: "Open Source Enthusiast", desc: "Passionate about open source tools and contributing to the community. Building solutions with Linux, Kubernetes, Terraform, and other FOSS technologies." },
							{ icon: "fa-solid fa-plane", title: "Aviation Infrastructure", desc: "Managing critical systems for Abu Dhabi, Sharjah, and other UAE airports, plus Muscat International Airport in Oman." },
						].map((card) => (
							<div key={card.title} className="glass-card rounded-2xl p-8 group">
								<div className="flex items-start gap-5">
									<div className="w-12 h-12 bg-white/[0.04] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#00ff41]/10 transition-all duration-300" aria-hidden="true">
										<i className={`${card.icon} text-white/30 group-hover:text-[#00ff41] transition-colors duration-300`}></i>
									</div>
									<div>
										<h4 className="text-white font-bold text-base mb-2">{card.title}</h4>
										<p className="text-white/40 text-sm leading-relaxed">{card.desc}</p>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* CTA */}
					<div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
						<ButtonPrimary isIcon={true} href="/#contact">Get In Touch</ButtonPrimary>
						<a
							className="inline-flex items-center justify-center px-6 py-3 text-white/60 hover:text-[#00ff41] bg-transparent border border-white/10 hover:border-[#00ff41]/30 rounded-full transition-all duration-300 text-sm font-semibold min-w-[180px] h-[50px] group"
							href="https://www.linkedin.com/in/ashiwanikumar/"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Connect on LinkedIn"
						>
							<i className="fa-brands fa-linkedin mr-2" aria-hidden="true"></i>
							Connect on LinkedIn
						</a>
					</div>
				</div>
			</div>
		</section>
	);
};

export default About5;
