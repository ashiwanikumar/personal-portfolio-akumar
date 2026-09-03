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
		{ value: "7+", label: "Years in production" },
		{ value: "99.9%", label: "Uptime maintained" },
		{ value: "500+", label: "Servers managed" },
		{ value: "5", label: "UAE airports" },
	];

	const highlights = [
		"Kubernetes", "OpenShift", "Terraform", "Ansible",
		"CI/CD pipelines", "DevSecOps", "Cloud migration", "Open source",
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
								<span className="section-badge mb-6 inline-flex">Experience</span>
								<h2 id="resume-heading" className="text-[28px] md:text-[36px] lg:text-[42px] font-bold leading-[1.1] tracking-[-0.03em] mb-4 text-white">
									Where I&apos;ve{" "}
									<span className="gradient-text">been on call.</span>
								</h2>
								<p className="text-white/45 mb-8 text-[15px] leading-[1.75]">
									Seven years across aviation, healthcare, and telecom — industries
									where an outage makes the news, not just a postmortem.
								</p>

								{/* Stats Grid */}
								<div className="grid grid-cols-2 gap-3 mb-8">
									{stats.map((stat, idx) => (
										<div key={idx} className="glass-card rounded-xl p-4 text-center group">
											<div className="text-2xl font-bold text-white tracking-[-0.02em]">{stat.value}</div>
											<div className="text-white/35 text-xs font-mono mt-1">{stat.label}</div>
										</div>
									))}
								</div>

								{/* Highlights */}
								<div className="mb-8">
									<h4 className="text-xs font-medium text-white/30 font-mono mb-4 uppercase tracking-[0.2em]">
										Core skills
									</h4>
									<div className="flex flex-wrap gap-2">
										{highlights.map((item, idx) => (
											<span
												key={idx}
												className="px-3 py-1.5 text-xs font-mono bg-white/[0.04] text-white/60 border border-white/10 rounded-full transition-all duration-300 hover:border-[#10b981]/30 hover:text-[#34d399]"
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
									<div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/[0.08]">
										<div className="flex-shrink-0 rounded overflow-hidden">
											<CountryFlag country={country} className="w-7 h-5" />
										</div>
										<h3 className="text-sm font-semibold text-white/80 font-mono uppercase tracking-[0.14em]">
											{country}
										</h3>
									</div>

									{/* Experience Cards */}
									<div className="flex flex-col gap-4">
										{items.map((item, idx) => (
											<article
												key={idx}
												className="glass-card py-6 px-5 xl:px-8 rounded-2xl group"
											>
												<div className="flex flex-col gap-3">
													<div>
														<h4 className="text-base sm:text-lg leading-snug text-white mb-2 font-semibold tracking-[-0.01em]">
															{item.title}
														</h4>
														<p className="text-[#38bdf8]/80 text-sm font-mono mb-3 flex items-center gap-2">
															<i className="fa-solid fa-building text-xs flex-shrink-0" aria-hidden="true"></i>
															<span>{item.company}</span>
														</p>
														<p className="text-white/45 text-sm leading-[1.7]">
															{item.desc}
														</p>
													</div>
													<div>
														<time className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#10b981]/[0.07] border border-[#10b981]/15 rounded-full">
															<i className="fa-regular fa-calendar text-xs text-[#34d399]" aria-hidden="true"></i>
															<span className="text-[#34d399]/90 text-xs font-mono font-medium whitespace-nowrap">
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
