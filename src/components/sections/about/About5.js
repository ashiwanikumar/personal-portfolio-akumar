import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";

const About5 = () => {
	return (
		<section id="about">
			<div className="py-60px md:py-20 lg:py-30 bg-[#001100] overflow-x-hidden">
				<div className="container">
					<div className="grid lg:grid-cols-2 gap-10 items-center">
						{/* DevOps Animation Column - Left Side on Desktop */}
						<div className="flex items-center justify-center order-2 lg:order-1">
							<div className="relative w-full max-w-[600px]">
								{/* Central DevOps Symbol */}
								<div className="relative w-80 h-80 mx-auto">
									{/* Outer static ring */}
									<div className="absolute inset-0 rounded-full border-4 border-dashed border-[#00ff41]/40"></div>

									{/* Inner static circle */}
									<div className="absolute inset-6 rounded-full bg-[#00ff41] opacity-10 blur-xl"></div>

									{/* Core DevOps text */}
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="text-center">
											<h3 className="text-5xl font-bold text-[#00ff41] mb-3 font-mono">DevOps</h3>
											<p className="text-xl text-[#00ff41]/60">∞</p>
										</div>
									</div>

									{/* Static orbiting elements */}
									<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6">
										<div className="w-20 h-20 bg-[#002200] border border-[#00ff41]/50 rounded-lg flex items-center justify-center text-[#00ff41] font-bold shadow-[0_0_15px_rgba(0,255,65,0.3)] text-sm font-mono">
											CI/CD
										</div>
									</div>
									<div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6">
										<div className="w-20 h-20 bg-[#002200] border border-[#00ff41]/50 rounded-lg flex items-center justify-center text-[#00ff41] font-bold shadow-[0_0_15px_rgba(0,255,65,0.3)] text-sm font-mono">
											K8s
										</div>
									</div>
									<div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6">
										<div className="w-20 h-20 bg-[#002200] border border-[#00ff41]/50 rounded-lg flex items-center justify-center text-[#00ff41] font-bold shadow-[0_0_15px_rgba(0,255,65,0.3)] text-sm font-mono">
											AWS
										</div>
									</div>
									<div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6">
										<div className="w-20 h-20 bg-[#002200] border border-[#00ff41]/50 rounded-lg flex items-center justify-center text-[#00ff41] font-bold shadow-[0_0_15px_rgba(0,255,65,0.3)] text-sm font-mono">
											SRE
										</div>
									</div>

									{/* Additional corner elements */}
									<div className="absolute top-1/4 right-1/4 translate-x-4 -translate-y-4">
										<div className="w-16 h-16 bg-[#002200] border border-[#00ff41]/50 rounded-lg flex items-center justify-center text-[#00ff41] font-bold shadow-[0_0_15px_rgba(0,255,65,0.3)] text-xs font-mono">
											Docker
										</div>
									</div>
									<div className="absolute bottom-1/4 left-1/4 -translate-x-4 translate-y-4">
										<div className="w-16 h-16 bg-[#002200] border border-[#00ff41]/50 rounded-lg flex items-center justify-center text-[#00ff41] font-bold shadow-[0_0_15px_rgba(0,255,65,0.3)] text-xs font-mono">
											Terraform
										</div>
									</div>
								</div>

								{/* Static particles around the symbol */}
								<div className="absolute -top-12 -left-12 w-24 h-24 bg-[#00ff41] rounded-full blur-[60px] opacity-20"></div>
								<div className="absolute -bottom-12 -right-12 w-28 h-28 bg-[#00ff41] rounded-full blur-[80px] opacity-20"></div>
								<div className="absolute top-1/2 -left-20 w-20 h-20 bg-[#00ff41] rounded-full blur-[60px] opacity-20"></div>
							</div>
						</div>

						{/* Content Column - Right Side on Desktop */}
						<div className="w-full text-center lg:text-left order-1 lg:order-2">
							<div className="mb-25px">
								<span
									className="text-xs uppercase text-[#00ff41] font-semibold relative inline-block tracking-0.2em wow fadeInRight font-mono"
									data-wow-delay=".3s"
								>
									&gt;_ About Me
								</span>
							</div>
							<h2 className="text-3xl md:text-size-35 lg:text-size-40 xl:text-size-45 uppercase font-bold leading-1.2 -tracking-0.02em text-[#00ff41] mb-35px">
								Experienced DevOps Engineer Building Scalable Solutions.
							</h2>
							<div className="w-full max-w-[800px] mx-auto">
								<p
									className="text-[#00cc33] leading-1.5 mb-30px text-lg wow fadeInUp font-mono"
									data-wow-delay=".3s"
								>
									With 6+ years of experience in DevOps and Linux administration, currently managing
									critical infrastructure for 5 UAE airports with 400+ servers. Specialized in
									cloud platforms (AWS, Azure), container orchestration (Kubernetes, Docker),
									CI/CD automation, and maintaining 99.9% uptime for mission-critical systems.
								</p>
								<div
									className="grid grid-cols-2 md:grid-cols-3 gap-y-4 max-w-600px mx-auto wow fadeInUp"
									data-wow-delay=".3s"
								>
									<span className="text-base font-semibold text-[#00ff41] flex items-center gap-2 font-mono">
										<span className="w-2 h-2 bg-[#00ff41] rounded-full"></span>
										Cloud Architecture
									</span>
									<span className="text-base font-semibold text-[#00ff41] flex items-center gap-2 font-mono">
										<span className="w-2 h-2 bg-[#00ff41] rounded-full"></span>
										CI/CD Pipelines
									</span>
									<span className="text-base font-semibold text-[#00ff41] flex items-center gap-2 font-mono">
										<span className="w-2 h-2 bg-[#00ff41] rounded-full"></span>
										Infrastructure as Code
									</span>
									<span className="text-base font-semibold text-[#00ff41] flex items-center gap-2 font-mono">
										<span className="w-2 h-2 bg-[#00ff41] rounded-full"></span>
										Container Orchestration
									</span>
									<span className="text-base font-semibold text-[#00ff41] flex items-center gap-2 font-mono">
										<span className="w-2 h-2 bg-[#00ff41] rounded-full"></span>
										Monitoring & Observability
									</span>
									<span className="text-base font-semibold text-[#00ff41] flex items-center gap-2 font-mono">
										<span className="w-2 h-2 bg-[#00ff41] rounded-full"></span>
										Automation & Scripting
									</span>
								</div>
								<div
									className="mt-35px wow fadeInUp"
									data-wow-delay=".3s"
								>
									<div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
										<ButtonPrimary isIcon={true} href="/#contact">
											Learn More
										</ButtonPrimary>
										<a
											className="inline-flex items-center justify-center px-6 py-3 text-[#00ff41] bg-transparent border-2 border-[#00ff41] hover:bg-[#00ff41]/10 hover:shadow-[0_0_20px_rgba(0,255,65,0.3)] rounded-full transition-all duration-300 text-sm font-bold min-w-[180px] h-[50px] font-mono"
											href="https://www.linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=ashiwanikumar"
											target="_blank"
											rel="noopener noreferrer"
										>
											<i className="fa-brands fa-linkedin mr-2"></i>
											Follow on LinkedIn
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default About5;
