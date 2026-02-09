"use client";

import ButtonDownload from "@/components/shared/buttons/ButtonDownload";
import getResume from "@/libs/getResume";

const Resume7 = () => {
	const resume = getResume();
	const experienceItems = resume?.[0]?.resumeItems || [];

	// Group items by country
	const groupedByCountry = experienceItems.reduce((acc, item) => {
		const country = item.country || "Other";
		if (!acc[country]) {
			acc[country] = {
				flag: item.flag || "🌐",
				items: []
			};
		}
		acc[country].items.push(item);
		return acc;
	}, {});

	const stats = [
		{ value: "7+", label: "Years Experience" },
		{ value: "99.9%", label: "Uptime Achieved" },
		{ value: "500+", label: "Servers Managed" },
		{ value: "5", label: "UAE Airports" },
	];

	const highlights = [
		"Open Source Enthusiast",
		"Kubernetes",
		"OpenShift",
		"Terraform",
		"Ansible",
		"CI/CD Pipelines",
		"DevSecOps",
		"Cloud Migration",
	];

	return (
		<section id="resume">
			<div className="pb-60px md:pb-20 lg:pb-30 relative">
				<div className="container">
					<div className="flex flex-wrap lg:flex-nowrap justify-between gap-30px lg:gap-50px xl:gap-60px">
						{/* Left Column - Sticky */}
						<div className="w-full lg:w-[400px] xl:w-[450px] lg:flex-shrink-0">
							<div className="lg:sticky lg:top-[100px]">
								<div className="mb-25px">
									<span
										className="text-xs uppercase text-[#00ff41] font-semibold relative inline-block tracking-0.2em wow fadeInRight font-mono"
										data-wow-delay=".3s"
									>
										&gt;_ Professional Journey
									</span>
								</div>
								<h2 className="text-3xl md:text-size-35 lg:text-size-40 xl:text-size-45 uppercase font-bold leading-1.2 -tracking-0.02em text-[#00ff41] mb-4">
									Let's Explore My Experience.
								</h2>
								<p className="text-[#00cc33] mb-6 font-mono text-sm leading-relaxed">
									Over 7 years of experience in DevOps, Linux administration, and cloud infrastructure
									management across aviation, healthcare, and telecommunications industries.
								</p>

								{/* Stats Grid */}
								<div className="grid grid-cols-2 gap-3 mb-6">
									{stats.map((stat, idx) => (
										<div
											key={idx}
											className="bg-[#002200] border border-[#00ff41]/30 rounded-[15px] p-4 text-center hover:border-[#00ff41] transition-all duration-300"
										>
											<div className="text-2xl font-bold text-[#00ff41] font-mono">{stat.value}</div>
											<div className="text-[#00cc33]/70 text-xs font-mono mt-1">{stat.label}</div>
										</div>
									))}
								</div>

								{/* Highlights */}
								<div className="mb-6">
									<h4 className="text-sm font-bold text-[#00ff41] font-mono mb-3 uppercase tracking-wider">
										Core Skills
									</h4>
									<div className="flex flex-wrap gap-2">
										{highlights.map((item, idx) => (
											<span
												key={idx}
												className="px-3 py-1.5 text-xs font-mono bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30 rounded-full"
											>
												{item}
											</span>
										))}
									</div>
								</div>

								<div className="wow fadeInUp" data-wow-delay=".3s">
									<ButtonDownload />
								</div>
							</div>
						</div>

						<div className="w-full lg:flex-1 flex flex-col gap-30px">
							{Object.entries(groupedByCountry).map(([country, { flag, items }]) => (
								<div key={country} className="mb-4">
									{/* Country Header */}
									<div className="flex items-center gap-3 mb-4 pb-2 border-b border-[#00ff41]/30">
										<span className="text-2xl" role="img" aria-label={country}>{flag}</span>
										<h3 className="text-lg font-bold text-[#00ff41] font-mono uppercase tracking-wider">
											{country}
										</h3>
									</div>

									{/* Experience Cards for this country */}
									<div className="flex flex-col gap-4">
										{items.map((item, idx) => (
											<div
												key={idx}
												className="py-25px px-20px xl:px-30px bg-[#002200] border border-[#00ff41]/30 hover:border-[#00ff41] rounded-[30px] transition-all duration-300 group hover:shadow-[0_0_20px_rgba(0,255,65,0.15)]"
											>
												<div className="flex flex-col md:flex-row md:items-start gap-4">
													{/* Left: Title & Company */}
													<div className="flex-1">
														<h4 className="text-lg lg:text-xl leading-1.2 text-[#00ff41] mb-2 font-mono font-bold">
															{item.title}
														</h4>
														<p className="text-[#00ff88] text-sm font-mono mb-3 flex items-center gap-2">
															<i className="fa-solid fa-building text-xs"></i>
															{item.company}
														</p>
														<p className="text-[#00cc33]/80 text-sm leading-relaxed font-mono">
															{item.desc}
														</p>
													</div>

													{/* Right: Date */}
													<div className="md:flex-shrink-0 md:text-right">
														<div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00ff41]/10 border border-[#00ff41]/30 rounded-full">
															<i className="fa-regular fa-calendar text-xs text-[#00ff41]"></i>
															<span className="text-[#00ff41] text-xs font-mono font-medium whitespace-nowrap">
																{item.date}
															</span>
														</div>
													</div>
												</div>
											</div>
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
