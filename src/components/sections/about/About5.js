import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";

const About5 = () => {
	return (
		<section id="about">
			<div className=" py-60px md:py-20 lg:py-30 bg-cream-light-color dark:bg-black-color overflow-x-hidden">
				<div className="container">
					{/* <!-- section heading --> */}

					<div className="grid lg:grid-cols-2 gap-10 items-center">
						{/* DevOps Animation Column - Left Side on Desktop */}
						<div className="flex items-center justify-center order-2 lg:order-1">
							<div className="relative w-full max-w-[600px]">
								{/* Central DevOps Symbol */}
								<div className="relative w-80 h-80 mx-auto">
									{/* Outer static ring */}
									<div className="absolute inset-0 rounded-full border-4 border-dashed border-primary-color/40"></div>
									
									{/* Inner static circle */}
									<div className="absolute inset-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur-xl"></div>
									
									{/* Core DevOps text */}
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="text-center">
											<h3 className="text-5xl font-bold text-primary-color mb-3">DevOps</h3>
											<p className="text-xl text-gray-600 dark:text-gray-400">∞</p>
										</div>
									</div>
									
									{/* Static orbiting elements */}
									<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6">
										<div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-xl text-sm">
											CI/CD
										</div>
									</div>
									<div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6">
										<div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold shadow-xl text-sm">
											K8s
										</div>
									</div>
									<div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6">
										<div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold shadow-xl text-sm">
											AWS
										</div>
									</div>
									<div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6">
										<div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-xl text-sm">
											SRE
										</div>
									</div>
									
									{/* Additional corner elements */}
									<div className="absolute top-1/4 right-1/4 translate-x-4 -translate-y-4">
										<div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold shadow-xl text-xs">
											Docker
										</div>
									</div>
									<div className="absolute bottom-1/4 left-1/4 -translate-x-4 translate-y-4">
										<div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold shadow-xl text-xs">
											Terraform
										</div>
									</div>
								</div>
								
								{/* Static particles around the symbol */}
								<div className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-40"></div>
								<div className="absolute -bottom-12 -right-12 w-28 h-28 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur-xl opacity-40"></div>
								<div className="absolute top-1/2 -left-20 w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-40"></div>
								<div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full blur-xl opacity-40"></div>
							</div>
						</div>

						{/* Content Column - Right Side on Desktop */}
						<div className="w-full text-center lg:text-left order-1 lg:order-2">
							<div className="mb-25px">
								<span
									className="text-xs uppercase text-primary-color font-semibold relative inline-block tracking-0.2em wow fadeInRight"
									data-wow-delay=".3s"
								>
									About Me
								</span>
							</div>
							<h2 className="text-3xl md:text-size-35 lg:text-size-40 xl:text-size-45 uppercase font-semibold leading-1.2 -tracking-0.02em text-seondary-color dark:text-white-color mb-35px tj-text-invert">
								Experienced DevOps Engineer Building Scalable Solutions.
							</h2>
							<div className="w-full max-w-[800px] mx-auto">
								<p
									className="text-gray-color-2 dark:text-gray-color-2 leading-1.5 mb-30px text-lg wow fadeInUp"
									data-wow-delay=".3s"
								>
									With 8+ years of experience in DevOps and Linux administration, currently managing 
									critical infrastructure for 5 UAE airports with 400+ servers. Specialized in 
									cloud platforms (AWS, Azure), container orchestration (Kubernetes, Docker), 
									CI/CD automation, and maintaining 99.9% uptime for mission-critical systems.
								</p>
								<div
									className="grid grid-cols-2 md:grid-cols-3 gap-y-4 max-w-600px mx-auto wow fadeInUp"
									data-wow-delay=".3s"
								>
									<span className="text-base font-semibold text-seondary-color dark:text-white-color flex items-center gap-2">
										<span className="w-2 h-2 bg-primary-color rounded-full"></span>
										Cloud Architecture
									</span>
									<span className="text-base font-semibold text-seondary-color dark:text-white-color flex items-center gap-2">
										<span className="w-2 h-2 bg-primary-color rounded-full"></span>
										CI/CD Pipelines
									</span>
									<span className="text-base font-semibold text-seondary-color dark:text-white-color flex items-center gap-2">
										<span className="w-2 h-2 bg-primary-color rounded-full"></span>
										Infrastructure as Code
									</span>
									<span className="text-base font-semibold text-seondary-color dark:text-white-color flex items-center gap-2">
										<span className="w-2 h-2 bg-primary-color rounded-full"></span>
										Container Orchestration
									</span>
									<span className="text-base font-semibold text-seondary-color dark:text-white-color flex items-center gap-2">
										<span className="w-2 h-2 bg-primary-color rounded-full"></span>
										Monitoring & Observability
									</span>
									<span className="text-base font-semibold text-seondary-color dark:text-white-color flex items-center gap-2">
										<span className="w-2 h-2 bg-primary-color rounded-full"></span>
										Automation & Scripting
									</span>
								</div>
								<div
									className="mt-35px wow fadeInUp"
									data-wow-delay=".3s"
								>
									<div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
										<ButtonPrimary isIcon={true} href="/#contact">
											Learn More{" "}
										</ButtonPrimary>
										<a 
											className="inline-flex items-center justify-center px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all duration-300 text-sm font-medium min-w-[180px] h-[50px]"
											href="https://www.linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=ashiwanikumar" 
											target="_blank"
											rel="noopener noreferrer"
										>
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
