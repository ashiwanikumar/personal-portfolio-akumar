"use client";

import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";

const About5 = () => {
	const skills = [
		{ icon: "fa-brands fa-aws", name: "AWS", desc: "Cloud Platform" },
		{ icon: "fa-brands fa-docker", name: "Docker", desc: "Containerization" },
		{ icon: "fa-solid fa-dharmachakra", name: "Kubernetes", desc: "Orchestration" },
		{ icon: "fa-brands fa-redhat", name: "OpenShift", desc: "Enterprise K8s" },
		{ icon: "fa-solid fa-code-branch", name: "Terraform", desc: "IaC" },
		{ icon: "fa-solid fa-gears", name: "Ansible", desc: "Automation" },
	];

	const stats = [
		{ value: "7+", label: "Years Experience" },
		{ value: "99.9%", label: "Uptime" },
		{ value: "500+", label: "Servers" },
		{ value: "5", label: "UAE Airports" },
	];

	return (
		<section id="about">
			<div className="py-60px md:py-20 lg:py-30 bg-[#001100]">
				<div className="container">
					{/* Section Header */}
					<div className="text-center mb-50px">
						<span className="text-xs uppercase text-[#00ff41] font-semibold tracking-0.2em mb-4 block font-mono">
							&gt;_ About Me
						</span>
						<h2 className="text-3xl md:text-size-35 lg:text-size-40 xl:text-size-45 uppercase font-bold leading-1.2 -tracking-0.02em text-[#00ff41] mb-6">
							Building Reliable Infrastructure
						</h2>
						<p className="text-[#00cc33] max-w-3xl mx-auto text-lg font-mono leading-relaxed">
							Site Reliability Engineer with 7+ years of experience managing mission-critical
							infrastructure. Currently ensuring 99.9% uptime for 5 UAE airports serving 50M+
							annual passengers. Passionate about open source and automation.
						</p>
					</div>

					{/* Stats Row */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-50px max-w-4xl mx-auto">
						{stats.map((stat, idx) => (
							<div
								key={idx}
								className="bg-[#002200] border border-[#00ff41]/30 rounded-[20px] p-6 text-center hover:border-[#00ff41] hover:shadow-[0_0_20px_rgba(0,255,65,0.15)] transition-all duration-300"
							>
								<div className="text-3xl md:text-4xl font-bold text-[#00ff41] font-mono mb-2">
									{stat.value}
								</div>
								<div className="text-[#00cc33]/70 text-sm font-mono">
									{stat.label}
								</div>
							</div>
						))}
					</div>

					{/* Skills Grid */}
					<div className="mb-50px">
						<h3 className="text-center text-lg font-bold text-[#00ff41] font-mono mb-6 uppercase tracking-wider">
							Tech Stack
						</h3>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
							{skills.map((skill, idx) => (
								<div
									key={idx}
									className="bg-[#002200] border border-[#00ff41]/30 rounded-[20px] p-5 text-center hover:border-[#00ff41] hover:shadow-[0_0_20px_rgba(0,255,65,0.15)] transition-all duration-300 group"
								>
									<div className="w-12 h-12 mx-auto mb-3 bg-[#00ff41]/10 rounded-full flex items-center justify-center group-hover:bg-[#00ff41]/20 transition-all duration-300">
										<i className={`${skill.icon} text-xl text-[#00ff41]`}></i>
									</div>
									<div className="text-[#00ff41] font-mono font-bold text-sm mb-1">
										{skill.name}
									</div>
									<div className="text-[#00cc33]/60 font-mono text-xs">
										{skill.desc}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Additional Info Cards */}
					<div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-50px">
						<div className="bg-[#002200] border border-[#00ff41]/30 rounded-[20px] p-6 hover:border-[#00ff41] transition-all duration-300">
							<div className="flex items-start gap-4">
								<div className="w-12 h-12 bg-[#00ff41]/10 rounded-full flex items-center justify-center flex-shrink-0">
									<i className="fa-solid fa-heart text-[#00ff41]"></i>
								</div>
								<div>
									<h4 className="text-[#00ff41] font-mono font-bold mb-2">Open Source Enthusiast</h4>
									<p className="text-[#00cc33]/80 font-mono text-sm leading-relaxed">
										Passionate about open source tools and contributing to the community.
										Building solutions with Linux, Kubernetes, Terraform, and other FOSS technologies.
									</p>
								</div>
							</div>
						</div>
						<div className="bg-[#002200] border border-[#00ff41]/30 rounded-[20px] p-6 hover:border-[#00ff41] transition-all duration-300">
							<div className="flex items-start gap-4">
								<div className="w-12 h-12 bg-[#00ff41]/10 rounded-full flex items-center justify-center flex-shrink-0">
									<i className="fa-solid fa-plane text-[#00ff41]"></i>
								</div>
								<div>
									<h4 className="text-[#00ff41] font-mono font-bold mb-2">Aviation Infrastructure</h4>
									<p className="text-[#00cc33]/80 font-mono text-sm leading-relaxed">
										Managing critical systems for Abu Dhabi, Sharjah, and other UAE airports, plus Muscat International Airport in Oman.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
						<ButtonPrimary isIcon={true} href="/#contact">
							Get In Touch
						</ButtonPrimary>
						<a
							className="inline-flex items-center justify-center px-6 py-3 text-[#00ff41] bg-transparent border-2 border-[#00ff41] hover:bg-[#00ff41]/10 hover:shadow-[0_0_20px_rgba(0,255,65,0.3)] rounded-full transition-all duration-300 text-sm font-bold min-w-[180px] h-[50px] font-mono"
							href="https://www.linkedin.com/in/ashiwanikumar/"
							target="_blank"
							rel="noopener noreferrer"
						>
							<i className="fa-brands fa-linkedin mr-2"></i>
							Connect on LinkedIn
						</a>
					</div>
				</div>
			</div>
		</section>
	);
};

export default About5;
