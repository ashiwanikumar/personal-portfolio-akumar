"use client";

const Cta5 = () => {
	return (
		<section id="contact">
			<div className="container">
				<div className="bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 py-35px px-15px sm:py-10 lg:px-25px lg:py-70px rounded-25px relative z-0 overflow-hidden before:absolute before:inset-0 before:bg-black/40 before:z-0">
					<div className="text-center relative z-10">
						<div className="mb-5  wow fadeInUp" data-wow-delay=".3s">
							<span
								className="text-sm  uppercase text-white font-bold tracking-0.2em relative inline-block wow fadeInRight drop-shadow-lg"
								data-wow-delay=".3s"
							>
								Let's Connect
							</span>
						</div>
						<div className="wow fadeInUp" data-wow-delay=".4s">
							<h2 className="text-size-35 sm:text-size-50 md:text-6xl lg:text-size-70 xl:text-size-88 -tracking-0.02em text-white leading-1 md:leading-1 2xl:leading-1 font-bold mb-15px inline-block uppercase drop-shadow-2xl [text-shadow:_2px_2px_4px_rgb(0_0_0_/_40%)]">
								Ready to Scale Your Infrastructure?
							</h2>
						</div>
						<div className="wow fadeInUp" data-wow-delay=".5s">
							<p className="text-white/90 font-medium transition-all duration-300 text-lg drop-shadow-md max-w-3xl mx-auto">
								With 8+ years of DevOps expertise, I can help automate your cloud infrastructure, 
								build robust CI/CD pipelines, and ensure 99.9% uptime for your critical systems.
							</p>
						</div>
						<div
							className="flex flex-col items-center mt-10 wow fadeInUp"
							data-wow-delay=".6s"
						>
							<div className=" w-[105px] h-[105px] sm:w-30 sm:h-[120px] md:w-[150px] md:h-[150px]  bg-gradient-14 backdrop-blur-[32px]  border border-border-color-4 rounded-50% relative">
								<div className="circle-wrap absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
									<svg
										className="fill-white-color font-normal w-[95px] h-[95px] sm:w-[100px] sm:h-[105px] md:w-[125px] md:h-[125px]"
										viewBox="0 0 140 100"
										width="125"
										height="125"
									>
										<defs>
											<path
												id="circle3"
												d=" M 50, 50 m -37, 0 a 37,37 0 1,1 110,0 a 37,37 0 1,1 -110,0"
											></path>
										</defs>
										<text fontSize="14">
											<textPath xlinkHref="#circle3" className="shape-1">
												DEVOPS ENGINEER • SRE EXPERT • CLOUD ARCHITECT • 
											</textPath>
										</text>
									</svg>
									<div className="circle-button">
										<a
											href="./index.html#contact"
											className=" flex-shrink-0  w-60px h-60px text-white-color hover:text-white-color  bg-primary-color    rounded-100% leading-1 transition-all duration-300  inline-flex justify-center items-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  group"
										>
											<span className="relative overflow-hidden -rotate-45">
												<i className="fa-regular fa-arrow-right  text-lg group-hover:translate-x-150% transition-all duration-500 inline-block"></i>
												<i className="fa-regular fa-arrow-right absolute left-0 top-0 -translate-x-150% text-lg group-hover:-translate-x-0 transition-all duration-500"></i>
											</span>
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

export default Cta5;