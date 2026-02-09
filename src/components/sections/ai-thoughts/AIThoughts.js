"use client";

const AIThoughts = () => {
	const thoughts = [
		{
			icon: "fa-solid fa-robot",
			title: "AI-Powered Infrastructure",
			description: "Exploring how AI/ML can revolutionize infrastructure management, from predictive scaling to automated incident response."
		},
		{
			icon: "fa-solid fa-brain",
			title: "The Future of SRE",
			description: "AI will transform Site Reliability Engineering - from reactive monitoring to proactive self-healing systems."
		},
		{
			icon: "fa-solid fa-microchip",
			title: "MLOps & DevOps Convergence",
			description: "Building bridges between ML workflows and traditional DevOps practices for seamless AI deployment."
		},
		{
			icon: "fa-solid fa-cloud",
			title: "Cloud-Native AI",
			description: "Leveraging Kubernetes and cloud platforms to build scalable, reliable AI infrastructure."
		}
	];

	return (
		<section id="ai-thoughts" className="py-60px md:py-20 lg:py-30 bg-[#001100]">
			<div className="container">
				<div className="text-center mb-50px">
					<span className="text-xs uppercase text-[#00ff41] font-semibold tracking-0.2em mb-4 block font-mono">
						&gt;_ AI Vision
					</span>
					<h2 className="text-3xl md:text-size-35 lg:text-size-40 xl:text-size-45 uppercase font-bold leading-1.2 -tracking-0.02em text-[#00ff41] mb-4">
						Shaping the Future of AI Infrastructure
					</h2>
					<p className="text-[#00cc33] leading-1.5 max-w-600px mx-auto text-lg font-mono">
						Passionate about bridging the gap between DevOps excellence and AI innovation.
						Here&apos;s my vision for the future of infrastructure.
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-30px">
					{thoughts.map((thought, index) => (
						<div
							key={index}
							className="group p-6 bg-[#002200] border border-[#00ff41]/30 rounded-[30px] hover:border-[#00ff41] hover:shadow-[0_0_20px_rgba(0,255,65,0.2)] transition-all duration-300"
						>
							<div className="w-14 h-14 bg-[#00ff41]/10 group-hover:bg-[#00ff41]/20 rounded-[15px] flex items-center justify-center mb-5 transition-all duration-300 border border-[#00ff41]/30">
								<i className={`${thought.icon} text-xl text-[#00ff41] transition-colors duration-300`}></i>
							</div>
							<h3 className="text-xl font-bold text-[#00ff41] mb-3 font-mono">
								{thought.title}
							</h3>
							<p className="text-[#00cc33] leading-1.5 font-mono text-sm">
								{thought.description}
							</p>
						</div>
					))}
				</div>

				<div className="text-center mt-50px">
					<div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-[#002200] border border-[#00ff41]/30 rounded-[30px]">
						<span className="text-lg text-[#00ff41] font-medium font-mono">
							Want to discuss AI & DevOps?
						</span>
						<a
							href="https://x.com/theashvanikumar"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-6 py-3 bg-[#00ff41] text-[#001100] font-bold rounded-full hover:bg-[#00ff88] hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] transition-all duration-300 font-mono"
						>
							<i className="fa-brands fa-x-twitter"></i>
							Follow @theashvanikumar
						</a>
					</div>
				</div>
			</div>
		</section>
	);
};

export default AIThoughts;
