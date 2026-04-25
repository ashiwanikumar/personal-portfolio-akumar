"use client";

import TestimonialsCard8 from "@/components/shared/cards/TestimonialsCard8";
import getTestimonials from "@/libs/getTestimonials";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const Testimonials8 = () => {
	const testimonials = getTestimonials()?.slice(0, 4);
	return (
		<section id="testimonials" aria-labelledby="testimonials-heading">
			<div className="py-20 md:py-100px xl:py-30 bg-[#09090b] relative overflow-hidden">
				<div className="mesh-gradient" aria-hidden="true" />
				<div className="container relative z-10">
					<div className="testimonials">
						<div className="mb-10 md:mb-50px xl:mb-60px text-center">
							<span className="section-badge mb-6 inline-flex">
								<i className="fa-solid fa-terminal text-xs" aria-hidden="true"></i>
								Client Feedback
							</span>
							<h2 id="testimonials-heading" className="text-[26px] md:text-[32px] lg:text-[38px] xl:text-[44px] uppercase font-bold leading-1.2 -tracking-0.02em inline-block max-w-580px w-full">
								<span className="gradient-text">Hear From</span>{" "}
								<span className="text-white">My Clients</span>
							</h2>
						</div>
						<div className="overflow-hidden">
							<Swiper
								spaceBetween={24}
								slidesPerView={1}
								loop={true}
								pagination={{ clickable: true }}
								speed={3000}
								autoplay={{ delay: 6000 }}
								breakpoints={{
									576: { slidesPerView: 1.5 },
									768: { slidesPerView: 2 },
									1024: { slidesPerView: 3 },
								}}
								modules={[Pagination, Autoplay]}
								className="tj-testimonial-slider testimonial-slider-8"
							>
								{testimonials?.length
									? testimonials?.map((testimonial, idx) => (
											<SwiperSlide key={idx}>
												<TestimonialsCard8 testimonial={testimonial} />
											</SwiperSlide>
									  ))
									: null}
							</Swiper>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Testimonials8;
