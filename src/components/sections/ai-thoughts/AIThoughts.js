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
		<section id="ai-thoughts" className="py-60px md:py-20 lg:py-30 bg-white dark:bg-dark-color-2">
			<div className="container">
				<div className="text-center mb-50px">
					<span className="text-xs uppercase text-primary-color font-semibold tracking-0.2em mb-4 block">
						AI Vision
					</span>
					<h2 className="text-3xl md:text-size-35 lg:text-size-40 xl:text-size-45 uppercase font-semibold leading-1.2 -tracking-0.02em text-seondary-color dark:text-white-color mb-4">
						Shaping the Future of AI Infrastructure
					</h2>
					<p className="text-gray-color-2 dark:text-gray-color-2 leading-1.5 max-w-600px mx-auto text-lg">
						Passionate about bridging the gap between DevOps excellence and AI innovation.
						Here&apos;s my vision for the future of infrastructure.
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
					{thoughts.map((thought, index) => (
						<div
							key={index}
							className="group p-6 bg-cream-light-color dark:bg-black-color rounded-20 hover:bg-gradient-primary-8 transition-all duration-300"
						>
							<div className="w-16 h-16 bg-primary-color/10 group-hover:bg-white/20 rounded-full flex items-center justify-center mb-5 transition-all duration-300">
								<i className={`${thought.icon} text-2xl text-primary-color group-hover:text-white transition-colors duration-300`}></i>
							</div>
							<h3 className="text-xl font-semibold text-seondary-color dark:text-white-color group-hover:text-white mb-3 transition-colors duration-300">
								{thought.title}
							</h3>
							<p className="text-gray-color-2 group-hover:text-white/80 leading-1.5 transition-colors duration-300">
								{thought.description}
							</p>
						</div>
					))}
				</div>

				<div className="text-center mt-50px">
					<div className="inline-flex items-center gap-4 p-4 bg-gradient-to-r from-primary-color/10 to-purple-500/10 rounded-20">
						<span className="text-lg text-seondary-color dark:text-white-color font-medium">
							Want to discuss AI & DevOps?
						</span>
						<a
							href="https://x.com/theashvanikumar"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-6 py-3 bg-primary-color text-white rounded-full hover:bg-primary-color/90 transition-colors duration-300"
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
