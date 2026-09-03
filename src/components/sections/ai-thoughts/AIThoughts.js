"use client";

const AIThoughts = () => {
	const thoughts = [
		{
			icon: "fa-solid fa-robot",
			title: "AI-assisted operations",
			description: "Predictive scaling and automated incident response — using ML to see problems coming instead of paging humans after the fact.",
		},
		{
			icon: "fa-solid fa-brain",
			title: "The future of SRE",
			description: "Reactive monitoring is over. The next decade of reliability engineering is proactive, self-healing systems.",
		},
		{
			icon: "fa-solid fa-microchip",
			title: "MLOps meets DevOps",
			description: "ML workflows deserve the same rigor as application code — versioned, tested, and shipped through pipelines.",
		},
		{
			icon: "fa-solid fa-cloud",
			title: "Cloud-native AI",
			description: "Kubernetes is the natural home for AI workloads. I build the platforms that make model serving boring — in a good way.",
		},
	];

	return (
		<section id="ai-thoughts" className="py-60px md:py-20 lg:py-30 bg-[#09090b] relative overflow-hidden" aria-labelledby="ai-heading">
			<div className="mesh-gradient" aria-hidden="true" />
			<div className="container relative z-10">
				<div className="text-center mb-16">
					<span className="section-badge mb-6 inline-flex">Perspective</span>
					<h2 id="ai-heading" className="text-[26px] md:text-[30px] lg:text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] mb-5 text-white">
						Where DevOps{" "}
						<span className="gradient-text">meets AI.</span>
					</h2>
					<p className="text-white/45 leading-[1.75] max-w-600px mx-auto text-base">
						The most interesting problems right now sit at the intersection of
						reliability engineering and machine learning. Here&apos;s where I&apos;m looking.
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
					{thoughts.map((thought, index) => (
						<article
							key={index}
							className="glass-card p-7 rounded-2xl group"
						>
							<div className="w-12 h-12 bg-[#10b981]/10 border border-[#10b981]/15 rounded-xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:bg-[#10b981]/15 group-hover:scale-105" aria-hidden="true">
								<i className={`${thought.icon} text-lg text-[#34d399]`}></i>
							</div>
							<h3 className="text-base font-semibold text-white mb-3 leading-snug tracking-[-0.01em]">
								{thought.title}
							</h3>
							<p className="text-white/45 leading-[1.7] text-sm">
								{thought.description}
							</p>
						</article>
					))}
				</div>

				<div className="text-center mt-14">
					<div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 glass-card rounded-full">
						<span className="text-base text-white/80 font-medium">
							Want to talk AI &amp; infrastructure?
						</span>
						<a
							href="https://x.com/theashvanikumar"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10b981] hover:bg-[#34d399] text-[#022c22] font-medium rounded-lg transition-all duration-300 text-sm"
							aria-label="Follow Ashiwani Kumar on X (Twitter)"
						>
							<i className="fa-brands fa-x-twitter" aria-hidden="true"></i>
							Follow @theashvanikumar
						</a>
					</div>
				</div>
			</div>
		</section>
	);
};

export default AIThoughts;
