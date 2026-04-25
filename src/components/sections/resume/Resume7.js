"use client";

import ButtonDownload from "@/components/shared/buttons/ButtonDownload";
import CountryFlag from "@/components/shared/icons/CountryFlags";
import getResume from "@/libs/getResume";

const Resume7 = () => {
	const resume = getResume();
	const experienceItems = resume?.[0]?.resumeItems || [];

	const groupedByCountry = experienceItems.reduce((acc, item) => {
		const country = item.country || "Other";
		if (!acc[country]) {
			acc[country] = { flag: item.flag || "🌐", items: [] };
		}
		acc[country].items.push(item);
		return acc;
	}, {});

	const stats = [
		{ value: "7+", label: "Years Experience", icon: "fa-solid fa-calendar-check" },
		{ value: "99.9%", label: "Uptime Achieved", icon: "fa-solid fa-chart-line" },
		{ value: "500+", label: "Servers Managed", icon: "fa-solid fa-server" },
		{ value: "5", label: "UAE Airports", icon: "fa-solid fa-plane-departure" },
	];

	const highlights = [
		"Open Source Enthusiast", "Kubernetes", "OpenShift", "Terraform",
		"Ansible", "CI/CD Pipelines", "DevSecOps", "Cloud Migration",
	];

	return (
		<section id="resume" className="overflow-hidden" aria-labelledby="resume-heading">
			<div className="py-60px md:py-20 lg:py-30 relative">
				<div className="mesh-gradient" aria-hidden="true" />
				<div className="container px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="flex flex-wrap lg:flex-nowrap justify-between gap-30px lg:gap-50px xl:gap-60px">
						{/* Left Column - Sticky */}
						<div className="w-full lg:w-[400px] xl:w-[450px] lg:flex-shrink-0">
							<div className="lg:sticky lg:top-[100px]">
								<span className="section-badge mb-6 inline-flex">
									<i className="fa-solid fa-terminal text-xs" aria-hidden="true"></i>
									Professional Journey
								</span>
								<h2 id="resume-heading" className="text-[26px] md:text-[32px] lg:text-[38px] xl:text-[44px] uppercase font-bold leading-1.2 -tracking-0.02em mb-4">
									<span className="gradient-text">Let&apos;s Explore</span>{" "}
									<span className="text-white">My Experience.</span>
								</h2>
								<p className="text-white/40 mb-8 font-mono text-sm leading-relaxed">
									Over 7 years of experience in DevOps, Linux administration, and cloud infrastructure
									management across aviation, healthcare, and telecommunications industries.
								</p>

								{/* Stats Grid */}
								<div className="grid grid-cols-2 gap-3 mb-8">
									{stats.map((stat, idx) => (
										<div key={idx} className="glass-card rounded-[16px] p-4 text-center group">
											<div className="text-2xl font-bold gradient-text font-mono">{stat.value}</div>
											<div className="text-white/35 text-xs font-mono mt-1">{stat.label}</div>
										</div>
									))}
								</div>

								{/* Highlights */}
								<div className="mb-8">
									<h4 className="text-xs font-bold text-[#00ff41]/60 font-mono mb-4 uppercase tracking-[0.2em]">
										Core Skills
									</h4>
									<div className="flex flex-wrap gap-2">
										{highlights.map((item, idx) => (
											<span
												key={idx}
												className="px-3 py-1.5 text-xs font-mono bg-[#00ff41]/8 text-[#00ff41]/80 border border-[#00ff41]/15 rounded-full transition-all duration-300 hover:border-[#00ff41]/40 hover:text-[#00ff41]"
											>
												{item}
											</span>
										))}
									</div>
								</div>

								<ButtonDownload />
							</div>
						</div>

						<div className="w-full lg:flex-1 flex flex-col gap-8 min-w-0">
							{Object.entries(groupedByCountry).map(([country, { flag, items }]) => (
								<div key={country} className="mb-2 min-w-0">
									{/* Country Header */}
									<div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#00ff41]/15">
										<div className="flex-shrink-0 rounded overflow-hidden shadow-[0_0_8px_rgba(0,255,65,0.2)]">
											<CountryFlag country={country} className="w-7 h-5" />
										</div>
										<h3 className="text-base font-bold text-white font-mono uppercase tracking-[0.15em]">
											{country}
										</h3>
									</div>

									{/* Experience Cards */}
									<div className="flex flex-col gap-4">
										{items.map((item, idx) => (
											<article
												key={idx}
												className="glass-card py-6 px-5 xl:px-8 rounded-[20px] group"
											>
												<div className="flex flex-col gap-3">
													<div>
														<h4 className="text-base sm:text-lg lg:text-xl leading-tight text-white mb-2 font-mono font-bold">
															{item.title}
														</h4>
														<p className="text-[#00aaff]/80 text-sm font-mono mb-3 flex items-center gap-2">
															<i className="fa-solid fa-building text-xs flex-shrink-0" aria-hidden="true"></i>
															<span>{item.company}</span>
														</p>
														<p className="text-white/40 text-sm leading-relaxed font-mono">
															{item.desc}
														</p>
													</div>
													<div>
														<time className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00ff41]/8 border border-[#00ff41]/15 rounded-full">
															<i className="fa-regular fa-calendar text-xs text-[#00ff41]" aria-hidden="true"></i>
															<span className="text-[#00ff41]/80 text-xs font-mono font-medium whitespace-nowrap">
																{item.date}
															</span>
														</time>
													</div>
												</div>
											</article>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Resume7;
