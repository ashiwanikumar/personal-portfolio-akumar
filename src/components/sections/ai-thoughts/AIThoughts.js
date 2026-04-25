"use client";

const AIThoughts = () => {
	const thoughts = [
		{
			icon: "fa-solid fa-robot",
			title: "AI-Powered Infrastructure",
			description: "Exploring how AI/ML can revolutionize infrastructure management, from predictive scaling to automated incident response.",
			gradient: "from-[#00ff41]/15 to-[#00aaff]/10",
		},
		{
			icon: "fa-solid fa-brain",
			title: "The Future of SRE",
			description: "AI will transform Linux DevOps Engineering - from reactive monitoring to proactive self-healing systems.",
			gradient: "from-[#00aaff]/15 to-[#00cc88]/10",
		},
		{
			icon: "fa-solid fa-microchip",
			title: "MLOps & DevOps Convergence",
			description: "Building bridges between ML workflows and traditional DevOps practices for seamless AI deployment.",
			gradient: "from-[#00cc88]/15 to-[#00ff41]/10",
		},
		{
			icon: "fa-solid fa-cloud",
			title: "Cloud-Native AI",
			description: "Leveraging Kubernetes and cloud platforms to build scalable, reliable AI infrastructure.",
			gradient: "from-[#7B42BC]/15 to-[#00ff41]/10",
		},
	];

	return (
		<section id="ai-thoughts" className="py-60px md:py-20 lg:py-30 bg-[#09090b] relative overflow-hidden" aria-labelledby="ai-heading">
			<div className="mesh-gradient" aria-hidden="true" />
			<div className="container relative z-10">
				<div className="text-center mb-16">
					<span className="section-badge mb-6 inline-flex">
						<i className="fa-solid fa-terminal text-xs" aria-hidden="true"></i>
						AI Vision
					</span>
					<h2 id="ai-heading" className="text-[26px] md:text-[32px] lg:text-[38px] xl:text-[44px] uppercase font-bold leading-1.1 -tracking-0.02em mb-5">
						<span className="gradient-text">Shaping the Future</span>{" "}
						<span className="text-white">of AI Infrastructure</span>
					</h2>
					<p className="text-white/40/70 leading-1.7 max-w-600px mx-auto text-base font-sora">
						Passionate about bridging the gap between DevOps excellence and AI innovation.
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
					{thoughts.map((thought, index) => (
						<article
							key={index}
							className="glass-card p-7 rounded-[24px] group"
						>
							<div className={`w-14 h-14 bg-gradient-to-br ${thought.gradient} rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-5deg]`} aria-hidden="true">
								<i className={`${thought.icon} text-xl text-white`}></i>
							</div>
							<h3 className="text-lg font-bold text-white mb-3 font-sora leading-tight">
								{thought.title}
							</h3>
							<p className="text-white/40/65 leading-1.7 font-sora text-sm">
								{thought.description}
							</p>
						</article>
					))}
				</div>

				<div className="text-center mt-14">
					<div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 glass-card rounded-full">
						<span className="text-base text-white/80 font-medium font-sora">
							Want to discuss AI & DevOps?
						</span>
						<a
							href="https://x.com/theashvanikumar"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00ff41] to-[#00cc88] text-[#09090b] font-bold rounded-full hover:shadow-[0_0_30px_rgba(0,255,65,0.4)] transition-all duration-300 font-sora text-sm"
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
