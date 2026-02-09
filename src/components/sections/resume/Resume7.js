"use client";

import ButtonDownload from "@/components/shared/buttons/ButtonDownload";
import getResume from "@/libs/getResume";

const Resume7 = () => {
	const resume = getResume();
	return (
		<section id="resume">
			<div className=" pb-60px md:pb-20 lg:pb-30 relative ">
				<div className="container">
					<div className="flex flex-wrap justify-between gap-10px lg:gap-30px xl:gap-60px">
						<div className="w-full max-w-400 lg:max-w-365px xl:max-w-400">
							<div className="mb-10 md:mb-50px xl:mb-60px">
								<div className="mb-25px  ">
									<span
										className="text-xs  uppercase text-primary-color  font-semibold relative inline-block tracking-0.2em wow fadeInRight"
										data-wow-delay=".3s"
									>
										Professional Journey
									</span>
								</div>
								<h2 className="text-3xl md:text-size-35 lg:text-size-40 xl:text-size-45 uppercase font-semibold  leading-1.2 -tracking-0.02em inline-block text-seondary-color dark:text-white-color  max-w-580px w-full tj-text-invert">
									Let's Explore My Experience.
								</h2>
								<p className="text-gray-color-2 dark:text-gray-color-2 mt-15px">
									Over 8 years of expertise in DevOps, Linux administration, and cloud infrastructure 
									management across various industries including aviation, healthcare, and telecommunications.
								</p>
								<div
									className="mt-30px md:mt-35px wow fadeInUp"
									data-wow-delay=".3s"
								>
									<ButtonDownload />
								</div>
							</div>
						</div>

						<div className="w-full max-w-[815px] lg:max-w-[540px] xl:max-w-[655px] 2xl:max-w-[815px] ml-auto flex flex-col gap-30px">
							{resume?.length && resume[0]?.resumeItems?.length
								? resume[0].resumeItems.map((item, idx) => (
									<div
										key={idx}
										className="py-30px px-15px xl:px-30px  border border-body-color dark:border-bg-color-2  rounded-[30px]  transition-all duration-300 wow fadeInUp "
										data-wow-delay=".3s"
									>
										<div
											className=" flex flex-wrap 
										md:flex-nowrap   gap-30px "
										>
											<div className=" w-60px  flex-shrink-0">
												<img src={`/img/icons/h5-resume-${(idx % 4) + 1}.png`} alt="" />
											</div>
											<div className="flex-1">
												<div>
													<h4 className="text-xl leading-1.2  text-seondary-color dark:text-white-color mb-15px uppercase font-medium">
														{item.title}
													</h4>

													<p className=" text-primary-color dark:text-body-color group-hover:text-white-color transition-all text-size-15 uppercase mb-0 md:mb-15px duration-300">
														{item.desc}
													</p>
												</div>
											</div>

											<div className="md:flex-shrink-0 sm:ml-90px md:ml-auto mb-15px md:mb-0 ">
												<div className="flex items-center gap-10px text-lg sm:text-xl">
													<i className="fa-thin fa-calendar-check text-xl text-primary-color leading-1"></i>
													<p className="  text-gray-color-2 dark:text-gray-color-2 group-hover:text-white-color transition-all duration-300 md:ml-auto tracking-0.02em whitespace-nowrap">
														{item.date}
													</p>
												</div>
											</div>
										</div>
									</div>
							  ))
								: ""}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Resume7;