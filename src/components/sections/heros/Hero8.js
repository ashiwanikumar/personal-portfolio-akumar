"use client";

import ButtonPopupVideo from "@/components/shared/buttons/ButtonPopupVideo";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import TypeWriter from "@/components/shared/others/TypeWriter";

const Hero8 = () => {
	return (
		<section className="hero-section relative pt-170px pb-110px md:pb-30 lg:pt-220px lg:pb-5 2xl:pt-250px 2xl:pb-50px after:absolute after:top-0 after:left-2/3 after:w-322px after:h-308px after:blur-[150px] after:rounded-50% after:bg-gradient-circle after:-z-1 after:-mt-5% overflow-hidden">
			{/* <!-- bg --> */}

			<div className="container">
				<div className="grid lg:grid-cols-2 gap-y-[100px] md:gap-y-20 lg:gap-y-0 items-center">
					<div className="lg:pl-30px xl:pl-15px 2xl:pl-0 text-center lg:text-left">
						<h4 className="text-gray-color-2 text-lg leading-1.5 font-semibold flex items-center justify-center lg:justify-start gap-10px mb-5 lg:mb-30px">
							<span>
								<img
									className="origin-[70%_70%] animate-weave"
									src="/img/icons/hero-h8-1.png"
									alt="Icons"
								/>
							</span>
							<TypeWriter 
								text="Hi There, I am Ashiwani Kumar" 
								delay={150}
								className="text-gray-color-2 dark:text-gray-color-2"
							/>
						</h4>

						<h1 className="text-size-38 sm:text-size-45 md:text-size-50 xl:text-size-65 2xl:text-size-80 text-primary-color  dark:text-white-color leading-1.1 lg:leading-1.1  mb-5  tracking-[-0.02em] font-semibold uppercase ">
							DevOps & SRE<br />
							Engineer<br />
							Expert.
						</h1>

						<p className="text-lg md:text-xl leading-1.5 text-gray-color-2 dark:text-gray-color-2 max-w-420px mx-auto lg:mx-0">
							Automating cloud infrastructure, building CI/CD pipelines, and ensuring 
							system reliability at scale.
						</p>
						{/* <!-- action and social --> */}
						<div className="mt-30px md:mt-10">
							<ButtonPrimary isIcon={true} href="/#contact">
								Get In Touch{" "}
							</ButtonPrimary>
						</div>
					</div>
					{/* DevOps Image Column */}
					<div className="flex items-center justify-center lg:justify-end">
						<div className="relative w-full max-w-[500px] animate-float">
							<img
								className="w-full h-auto filter drop-shadow-2xl"
								src="/img/hero/ashiwani_devops.png"
								alt="DevOps Symbol"
							/>
							{/* Animated particles around the image */}
							<div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
							<div className="absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur-xl opacity-60 animate-pulse animation-delay-2000"></div>
							<div className="absolute top-1/2 -left-16 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-60 animate-pulse animation-delay-4000"></div>
						</div>
					</div>
				</div>
			</div>
			{/* <!-- hero socials --> */}
			<div className="absolute bottom-20 sm:bottom-[85px] lg:bottom-auto lg:top-1/2  left-1/2 lg:left-[10px]  3xl:left-[50px]  -translate-x-1/2 lg:translate-x-0 lg:-translate-y-1/2">
				<ul className="social-nav flex flex-row lg:flex-col items-center gap-5" style={{ border: 'none', backgroundColor: 'transparent', boxShadow: 'none' }}>
					<li className="nav_item group relative ">
						<a
							href="https://github.com/ashiwanikumar"
							target="_blank"
							rel="noopener noreferrer"
							className="text-size-15 font-normal text-seondary-color dark:text-white-color hover:text-primary-color dark:hover:text-primary-color capitalize flex gap-2 items-center "
						>
							<span
								className="text-dark-color group-hover:text-white-color dark:text-white-color
 border border-border-color dark:border-border-color-3 group-hover:border-transparent dark:group-hover:border-transparent w-35px h-35px rounded-full flex items-center justify-center overflow-hidden relative z-0 after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-full after:h-full after:scale-0 after:bg-gradient-primary-8 group-hover:after:scale-105 after:transition-all after:duration-300 after:z-[-1] after:rounded-full"
							>
								<i className="fa-brands fa-github "></i>
							</span>
						</a>
					</li>
					<li className="nav_item group relative ">
						<a
							href="https://www.linkedin.com/in/ashiwanikumar/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-size-15 font-normal text-seondary-color dark:text-white-color hover:text-primary-color dark:hover:text-primary-color capitalize flex gap-2 items-center "
						>
							<span
								className="text-dark-color group-hover:text-white-color dark:text-white-color
 border border-border-color dark:border-border-color-3 group-hover:border-transparent dark:group-hover:border-transparent w-35px h-35px rounded-full flex items-center justify-center overflow-hidden relative z-0 after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-full after:h-full after:scale-0 after:bg-gradient-primary-8 group-hover:after:scale-105 after:transition-all after:duration-300 after:z-[-1] after:rounded-full"
							>
								<i className="fa-brands fa-linkedin-in"></i>
							</span>
						</a>
					</li>
					<li className="nav_item group relative ">
						<a
							href="https://www.facebook.com/terminalrootuser"
							target="_blank"
							rel="noopener noreferrer"
							className="text-size-15 font-normal text-seondary-color dark:text-white-color hover:text-primary-color dark:hover:text-primary-color capitalize flex gap-2 items-center "
						>
							<span
								className="text-dark-color group-hover:text-white-color dark:text-white-color
 border border-border-color dark:border-border-color-3 group-hover:border-transparent dark:group-hover:border-transparent w-35px h-35px rounded-full flex items-center justify-center overflow-hidden relative z-0 after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-full after:h-full after:scale-0 after:bg-gradient-primary-8 group-hover:after:scale-105 after:transition-all after:duration-300 after:z-[-1] after:rounded-full"
							>
								<i className="fa-brands fa-facebook"></i>
							</span>
						</a>
					</li>
					<li className="nav_item group relative ">
						<a
							href="mailto:ashvanikumar109@gmail.com"
							className="text-size-15 font-normal text-seondary-color dark:text-white-color hover:text-primary-color dark:hover:text-primary-color capitalize flex gap-2 items-center "
						>
							<span
								className="text-dark-color group-hover:text-white-color dark:text-white-color
 border border-border-color dark:border-border-color-3 group-hover:border-transparent dark:group-hover:border-transparent w-35px h-35px rounded-full flex items-center justify-center overflow-hidden relative z-0 after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-full after:h-full after:scale-0 after:bg-gradient-primary-8 group-hover:after:scale-105 after:transition-all after:duration-300 after:z-[-1] after:rounded-full"
							>
								<i className="fa-regular fa-envelope"></i>
							</span>
						</a>
					</li>
				</ul>
			</div>

			{/* <!-- scroll --> */}
			{/* Removed scroll indicator to clean up the design */}
		</section>
	);
};

export default Hero8;
