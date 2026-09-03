"use client";
import ServiceCard6 from "@/components/shared/cards/ServiceCard6";
import getALlServices from "@/libs/getALlServices";

import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const Services8 = () => {
	const services = getALlServices()?.slice(0, 4);
	return (
		<section id="services" aria-labelledby="services-heading">
			<div className="py-60px md:py-20 lg:py-30 relative overflow-hidden">
				<div className="mesh-gradient" aria-hidden="true" />
				<div className="container relative z-10">
					<div className="mb-10 md:mb-50px xl:mb-60px flex flex-wrap justify-between items-end gap-6">
						<div>
							<span className="section-badge mb-6 inline-flex">Services</span>
							<h2 id="services-heading" className="text-[26px] md:text-[30px] lg:text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] inline-block max-w-580px w-full text-white">
								What I can take{" "}
								<span className="gradient-text">off your plate.</span>
							</h2>
							<p className="text-white/45 text-base leading-[1.75] max-w-[520px] mt-4">
								From cloud migrations to on-call firefighting — the unglamorous work
								that keeps your product shipping.
							</p>
						</div>
						<div>
							<div className="testimonial-navigation hidden lg:flex flex-wrap gap-3 items-center">
								<button
									className="service-prev w-12 h-12 inline-flex justify-center items-center glass-card rounded-full hover:bg-[#10b981]/10 transition-all duration-300"
									aria-label="Previous service"
								>
									<i className="fa-regular fa-arrow-left text-[#34d399]" aria-hidden="true"></i>
								</button>
								<button
									className="service-next w-12 h-12 inline-flex justify-center items-center glass-card rounded-full hover:bg-[#10b981]/10 transition-all duration-300"
									aria-label="Next service"
								>
									<i className="fa-regular fa-arrow-right text-[#34d399]" aria-hidden="true"></i>
								</button>
							</div>
						</div>
					</div>
					<div className="relative z-0">
						{services?.length ? (
							<Swiper
								slidesPerView={1}
								spaceBetween={24}
								loop={true}
								centeredSlides={true}
								pagination={{ clickable: true }}
								speed={2000}
								autoplay={{ delay: 3000 }}
								navigation={{
									prevEl: ".service-prev",
									nextEl: ".service-next",
								}}
								breakpoints={{
									430: { slidesPerView: 1.2 },
									768: { slidesPerView: 2 },
									1200: { slidesPerView: 3 },
								}}
								modules={[Pagination, Autoplay, Navigation]}
								className="testimonials-slider service-slider"
							>
								{services?.map((service, idx) => (
									<SwiperSlide key={idx}>
										<ServiceCard6 key={idx} idx={idx} service={service} />
									</SwiperSlide>
								))}
							</Swiper>
						) : null}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Services8;
