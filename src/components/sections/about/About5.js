import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";

const About5 = () => {
	return (
		<section id="about">
			<div className=" py-60px md:py-20 lg:py-30 bg-cream-light-color dark:bg-black-color overflow-x-hidden">
				<div className="container">
					{/* <!-- section heading --> */}

					<div className="flex flex-wrap items-center justify-center">
						<div className="w-full max-w-[1000px] mx-auto text-center">
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
