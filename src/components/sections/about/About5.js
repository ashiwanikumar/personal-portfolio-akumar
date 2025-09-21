import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";

const About5 = () => {
	return (
		<section id="about">
			<div className=" py-60px md:py-20 lg:py-30 bg-cream-light-color dark:bg-black-color overflow-x-hidden">
				<div className="container">
					{/* <!-- section heading --> */}

					<div className="flex flex-wrap items-center justify-center">
						<div className="w-full max-w-[1000px] mx-auto text-center">
							<div className="mb-25px  ">
								<span
									className="text-xs  uppercase text-primary-color  font-semibold relative inline-block tracking-0.2em wow fadeInRight"
									data-wow-delay=".3s"
								>
									About Me
								</span>
							</div>
							<h2 className="text-3xl md:text-size-35 lg:text-size-40 xl:text-size-45 uppercase font-semibold  leading-1.2 -tracking-0.02em inline-block text-seondary-color dark:text-white-color mb-35px lg:mb-5 xl:mb-30px   max-w-580px w-full tj-text-invert">
								Experienced DevOps Engineer Building Scalable Solutions.
							</h2>
							<div className="  w-full max-w-[510px]">
								<div>
									<p
										className="text-gray-color-2 dark:text-gray-color-2 leading-1.5   mb-30px   wow fadeInUp"
										data-wow-delay=".3s"
									>
										With 8+ years of experience in DevOps and Linux administration, currently managing 
										critical infrastructure for 5 UAE airports with 400+ servers. Specialized in 
										cloud platforms (AWS, Azure), container orchestration (Kubernetes, Docker), 
										CI/CD automation, and maintaining 99.9% uptime for mission-critical systems.
									</p>
									<div
										className="grid grid-cols-2  max-w-420px wow fadeInUp"
										data-wow-delay=".3s"
									>
										<span className="text-base leading-1.75 sm:leading-1.75 font-semibold text-seondary-color dark:text-white-color block relative pl-3 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-5px before:h-5px dark:before:bg-white-color ">
											Cloud Architecture
										</span>
										<span className="text-base leading-1.75 sm:leading-1.75 font-semibold text-seondary-color dark:text-white-color block relative pl-3 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-5px before:h-5px dark:before:bg-white-color ">
											CI/CD Pipelines
										</span>
										<span className="text-base leading-1.75 sm:leading-1.75 font-semibold text-seondary-color dark:text-white-color block relative pl-3 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-5px before:h-5px dark:before:bg-white-color ">
											Infrastructure as Code
										</span>
										<span className="text-base leading-1.75 sm:leading-1.75 font-semibold text-seondary-color dark:text-white-color block relative pl-3 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-5px before:h-5px dark:before:bg-white-color ">
											Container Orchestration
										</span>
										<span className="text-base leading-1.75 sm:leading-1.75 font-semibold text-seondary-color dark:text-white-color block relative pl-3 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-5px before:h-5px dark:before:bg-white-color ">
											Monitoring & Observability
										</span>
										<span className="text-base leading-1.75 sm:leading-1.75 font-semibold text-seondary-color dark:text-white-color block relative pl-3 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-5px before:h-5px dark:before:bg-white-color ">
											Automation & Scripting
										</span>
									</div>
									<div
										className="mt-35px xl:mt-35px wow fadeInUp"
										data-wow-delay=".3s"
									>
										<ButtonPrimary isIcon={true} href="./index.html#contact">
											Learn More{" "}
										</ButtonPrimary>
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
