"use client";

import TypeWriterLoop from "@/components/shared/others/TypeWriterLoop";

const Cta5 = () => {
	const phrases = [
		"Ready to Scale Your Infrastructure?",
		"Need 99.9% Uptime for Your Systems?",
		"Want to Automate Your Cloud?",
		"Looking for DevOps Excellence?",
		"Ready to Build CI/CD Pipelines?",
	];

	return (
		<section id="contact" aria-labelledby="cta-heading">
			<div className="container py-20 md:py-28">
				<div className="glass-card py-16 px-6 sm:py-20 lg:px-16 lg:py-24 rounded-[32px] relative z-0 overflow-hidden">
					{/* Background glow */}
					<div className="absolute inset-0 opacity-20" aria-hidden="true">
						<div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#00ff41] rounded-full blur-[150px]"></div>
						<div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-[#00aaff] rounded-full blur-[160px]"></div>
					</div>

					<div className="text-center relative z-10">
						<span className="section-badge mb-8 inline-flex">Let&apos;s Connect</span>

						<div className="min-h-[80px] md:min-h-[110px] lg:min-h-[140px] flex items-center justify-center mb-8">
							<h2 id="cta-heading" className="text-[24px] sm:text-[30px] md:text-[36px] lg:text-[44px] xl:text-[50px] tracking-[-0.03em] leading-[1.1] font-bold uppercase">
								<span className="gradient-text">
									<TypeWriterLoop
										phrases={phrases}
										typeSpeed={60}
										deleteSpeed={30}
										pauseTime={2500}
									/>
								</span>
							</h2>
						</div>

						<p className="text-white/40 text-[16px] lg:text-[17px] max-w-2xl mx-auto mb-12 leading-[1.8]">
							With 7+ years of DevOps experience, I can help automate your cloud infrastructure,
							build robust CI/CD pipelines, and ensure 99.9% uptime for your critical systems.
						</p>

						<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
							<a
								href="mailto:ashvanikumar109@gmail.com"
								className="px-8 py-4 bg-gradient-to-r from-[#00ff41] to-[#00cc88] text-[#09090b] font-bold rounded-xl hover:shadow-[0_0_40px_rgba(0,255,65,0.3)] transition-all duration-300 flex items-center gap-2 text-sm"
								aria-label="Send email to Ashiwani Kumar"
							>
								<i className="fa-solid fa-envelope" aria-hidden="true"></i>
								Get In Touch
							</a>
							<a
								href="https://www.linkedin.com/in/ashiwanikumar/"
								target="_blank"
								rel="noopener noreferrer"
								className="px-8 py-4 bg-transparent border border-white/10 hover:border-[#00ff41]/30 text-white/60 hover:text-[#00ff41] font-bold rounded-xl transition-all duration-300 flex items-center gap-2 text-sm"
								aria-label="Connect on LinkedIn"
							>
								<i className="fa-brands fa-linkedin" aria-hidden="true"></i>
								LinkedIn
							</a>
						</div>

						<div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-white/30 text-sm">
							<span className="flex items-center gap-2">
								<i className="fa-solid fa-location-dot text-[#00ff41]/40" aria-hidden="true"></i>
								Abu Dhabi, UAE
							</span>
							<span className="hidden sm:block w-1 h-1 bg-white/15 rounded-full" aria-hidden="true"></span>
							<span className="flex items-center gap-2">
								<i className="fa-solid fa-phone text-[#00ff41]/40" aria-hidden="true"></i>
								+971-566182303
							</span>
							<span className="hidden sm:block w-1 h-1 bg-white/15 rounded-full" aria-hidden="true"></span>
							<span className="flex items-center gap-2">
								<i className="fa-solid fa-envelope text-[#00ff41]/40" aria-hidden="true"></i>
								ashvanikumar109@gmail.com
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Cta5;
