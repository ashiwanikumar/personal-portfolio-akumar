"use client";

const Cta5 = () => {
	return (
		<section id="contact">
			<div className="container py-60px md:py-20">
				<div className="bg-[#002200] border-2 border-[#00ff41]/30 py-50px px-15px sm:py-16 lg:px-25px lg:py-70px rounded-25px relative z-0 overflow-hidden">
					{/* Matrix-style background effects */}
					<div className="absolute inset-0 opacity-30">
						<div className="absolute top-0 left-1/4 w-32 h-32 bg-[#00ff41] rounded-full blur-[80px]"></div>
						<div className="absolute bottom-0 right-1/4 w-40 h-40 bg-[#00ff41] rounded-full blur-[100px]"></div>
					</div>

					<div className="text-center relative z-10">
						<div className="mb-5 wow fadeInUp" data-wow-delay=".3s">
							<span className="text-sm uppercase text-[#00ff41] font-bold tracking-0.2em relative inline-block font-mono">
								&gt;_ Let&apos;s Connect
							</span>
						</div>
						<div className="wow fadeInUp" data-wow-delay=".4s">
							<h2 className="text-size-35 sm:text-size-50 md:text-6xl lg:text-size-70 xl:text-size-80 -tracking-0.02em text-[#00ff41] leading-1 md:leading-1 2xl:leading-1 font-bold mb-15px inline-block uppercase">
								Ready to Scale Your Infrastructure?
							</h2>
						</div>
						<div className="wow fadeInUp" data-wow-delay=".5s">
							<p className="text-[#00cc33] font-medium transition-all duration-300 text-lg max-w-3xl mx-auto font-mono">
								With 6+ years of DevOps expertise, I can help automate your cloud infrastructure,
								build robust CI/CD pipelines, and ensure 99.9% uptime for your critical systems.
							</p>
						</div>
						<div
							className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 wow fadeInUp"
							data-wow-delay=".6s"
						>
							<a
								href="mailto:ashvanikumar109@gmail.com"
								className="px-8 py-4 bg-[#00ff41] text-[#001100] font-bold rounded-lg hover:bg-[#00ff88] hover:shadow-[0_0_30px_rgba(0,255,65,0.5)] transition-all duration-300 flex items-center gap-2 font-mono"
							>
								<i className="fa-solid fa-envelope"></i>
								Get In Touch
							</a>
							<a
								href="https://www.linkedin.com/in/ashiwanikumar/"
								target="_blank"
								rel="noopener noreferrer"
								className="px-8 py-4 bg-transparent border-2 border-[#00ff41] text-[#00ff41] font-bold rounded-lg hover:bg-[#00ff41]/10 hover:shadow-[0_0_20px_rgba(0,255,65,0.3)] transition-all duration-300 flex items-center gap-2 font-mono"
							>
								<i className="fa-brands fa-linkedin"></i>
								LinkedIn
							</a>
						</div>

						{/* Contact Info */}
						<div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-[#00cc33] font-mono text-sm">
							<span className="flex items-center gap-2">
								<i className="fa-solid fa-location-dot text-[#00ff41]"></i>
								Abu Dhabi, UAE
							</span>
							<span className="flex items-center gap-2">
								<i className="fa-solid fa-phone text-[#00ff41]"></i>
								+971-566182303
							</span>
							<span className="flex items-center gap-2">
								<i className="fa-solid fa-envelope text-[#00ff41]"></i>
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
