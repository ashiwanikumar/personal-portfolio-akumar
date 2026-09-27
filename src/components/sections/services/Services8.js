"use client";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import ServiceCard6 from "@/components/shared/cards/ServiceCard6";
import getALlServices from "@/libs/getALlServices";

import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// `isPage` renders the standalone /services layout: an h1, every service in a
// static grid with its tool list, and a contact prompt. The home page keeps
// the compact slider.
const Services8 = ({ isPage = false }) => {
	const allServices = getALlServices() || [];
	const services = isPage ? allServices : allServices.slice(0, 4);
	const HeadingTag = isPage ? "h1" : "h2";
	return (
		<section id="services" aria-labelledby="services-heading">
			<div className="py-60px md:py-20 lg:py-30 relative overflow-hidden">
				<div className="mesh-gradient" aria-hidden="true" />
				<div className="container relative z-10">
					<div className="mb-10 md:mb-50px xl:mb-60px flex flex-wrap justify-between items-end gap-6">
						<div>
							<span className="section-badge mb-6 inline-flex">Services</span>
							<HeadingTag id="services-heading" className="text-[26px] md:text-[30px] lg:text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] block max-w-580px w-full text-white">
								What I can take{" "}
								<span className="gradient-text">off your plate.</span>
							</HeadingTag>
							<p className="text-white/55 text-base leading-[1.75] max-w-[520px] mt-4">
								Cloud migrations, pipelines, on-call firefighting. The unglamorous
								work that keeps your product shipping.
							</p>
						</div>
						{isPage ? null : (
							<div>
								<div className="testimonial-navigation hidden lg:flex flex-wrap gap-3 items-center">
									<button
										type="button"
										className="service-prev w-12 h-12 inline-flex justify-center items-center glass-card rounded-full hover:bg-[#10b981]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#34d399] transition-all duration-300"
										aria-label="Previous service"
									>
										<i className="fa-solid fa-arrow-left text-[#34d399]" aria-hidden="true"></i>
									</button>
									<button
										type="button"
										className="service-next w-12 h-12 inline-flex justify-center items-center glass-card rounded-full hover:bg-[#10b981]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#34d399] transition-all duration-300"
										aria-label="Next service"
									>
										<i className="fa-solid fa-arrow-right text-[#34d399]" aria-hidden="true"></i>
									</button>
								</div>
							</div>
						)}
					</div>
					{isPage ? (
						<>
							<ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{services.map((service) => (
									<li key={service.id}>
										<ServiceCard6 service={service} showTools headingLevel="h2" />
									</li>
								))}
							</ul>
							<div className="mt-12 md:mt-16 flex flex-wrap items-center justify-between gap-6 glass-card rounded-2xl p-8">
								<div>
									<h2 className="text-lg md:text-xl font-semibold leading-[1.3] tracking-[-0.01em] text-white">
										Need a hand with one of these?
									</h2>
									<p className="text-sm text-white/55 leading-[1.7] mt-2 max-w-[520px]">
										I&apos;m based in Abu Dhabi and open to contract and full-time
										work. Tell me what you&apos;re running and where it hurts.
									</p>
								</div>
								<ButtonPrimary isIcon={true} href="/contact">
									Get in touch
								</ButtonPrimary>
							</div>
						</>
					) : (
						<div className="relative z-0">
							{services.length ? (
								<Swiper
									slidesPerView={1}
									spaceBetween={24}
									loop={true}
									centeredSlides={true}
									pagination={{ clickable: true }}
									speed={700}
									autoplay={{ delay: 4000, pauseOnMouseEnter: true, disableOnInteraction: true }}
									navigation={{
										prevEl: ".service-prev",
										nextEl: ".service-next",
									}}
									a11y={{
										prevSlideMessage: "Previous service",
										nextSlideMessage: "Next service",
										paginationBulletMessage: "Go to service {{index}}",
									}}
									breakpoints={{
										430: { slidesPerView: 1.2, centeredSlides: true },
										768: { slidesPerView: 2, centeredSlides: false },
										1200: { slidesPerView: 3, centeredSlides: false },
									}}
									modules={[Pagination, Autoplay, Navigation, A11y]}
									className="testimonials-slider service-slider"
								>
									{services.map((service) => (
										<SwiperSlide key={service.id} className="!h-auto">
											<ServiceCard6 service={service} />
										</SwiperSlide>
									))}
								</Swiper>
							) : null}
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default Services8;
