"use client";

import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import ShareButton from "@/components/shared/buttons/ShareButton";


const Hero8 = () => {
	return (
		<section
			className="hero-section relative pt-170px pb-110px md:pb-30 lg:pt-220px lg:pb-5 2xl:pt-250px 2xl:pb-50px overflow-hidden"
			aria-label="Hero section"
		>
			<div className="mesh-gradient" aria-hidden="true" />

			{/* Subtle grid pattern */}
			<div
				className="absolute inset-0 opacity-[0.02] z-0"
				style={{
					backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
					backgroundSize: '80px 80px',
				}}
				aria-hidden="true"
			/>

			<div className="container relative z-10">
				<div className="grid lg:grid-cols-2 gap-y-[80px] md:gap-y-16 lg:gap-y-0 items-center">
					<div className="lg:pl-30px xl:pl-15px 2xl:pl-0 text-center lg:text-left">
						<h1 className="text-[32px] sm:text-[40px] md:text-[48px] xl:text-[56px] 2xl:text-[64px] leading-[1.1] mb-6 tracking-[-0.03em] font-bold uppercase">
							<span className="gradient-text">DevOps & SRE</span>
							<br />
							<span className="text-white">Engineer</span>
							<br />
							<span className="text-white/40">Practitioner.</span>
						</h1>

						<p className="text-[17px] md:text-lg leading-[1.8] text-white/50 max-w-[440px] mx-auto lg:mx-0 mb-9">
							Automating cloud infrastructure, building CI/CD pipelines, and ensuring
							system reliability at scale.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start justify-center lg:justify-start">
							<ButtonPrimary isIcon={true} href="/#contact">
								Get In Touch
							</ButtonPrimary>
							<a
								href="/#portfolio"
								className="inline-flex items-center gap-2 text-white/60 hover:text-[#00ff41] text-sm font-medium transition-all duration-300 group"
								aria-label="View my projects"
							>
								View Projects
								<i className="fa-regular fa-arrow-right transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true"></i>
							</a>
						</div>
					</div>

					<div className="flex items-center justify-center lg:justify-end">
						<div className="relative w-full max-w-[500px]">
							<div
								className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00ff41]/10 via-[#00aaff]/5 to-[#00ff41]/10 blur-[100px] scale-90"
								aria-hidden="true"
							/>
							<img
								className="w-full h-auto filter drop-shadow-2xl relative z-10 animate-float"
								src="/img/hero/ashiwani_devops.png"
								alt="Ashiwani Kumar - DevOps & SRE Engineer illustration with cloud infrastructure symbols"
							/>
							<div className="hidden md:block absolute -top-8 -left-8 w-20 h-20 bg-[#00ff41]/15 rounded-full blur-2xl animate-pulse" aria-hidden="true" />
							<div className="hidden md:block absolute -bottom-8 -right-8 w-24 h-24 bg-[#00aaff]/10 rounded-full blur-2xl animate-pulse animation-delay-2000" aria-hidden="true" />
						</div>
					</div>
				</div>
			</div>

			<nav
				className="absolute bottom-16 sm:bottom-[85px] lg:bottom-auto lg:top-1/2 left-1/2 lg:left-[10px] 3xl:left-[50px] -translate-x-1/2 lg:translate-x-0 lg:-translate-y-1/2 z-20"
				aria-label="Social media links"
			>
				<ul className="flex flex-row lg:flex-col items-center gap-4" style={{ border: 'none', backgroundColor: 'transparent', boxShadow: 'none' }}>
					{[
						{ href: "https://github.com/ashiwanikumar", icon: "fa-brands fa-github", label: "GitHub" },
						{ href: "https://www.linkedin.com/in/ashiwanikumar/", icon: "fa-brands fa-linkedin-in", label: "LinkedIn" },
						{ href: "https://x.com/theashvanikumar", icon: "fa-brands fa-x-twitter", label: "X (Twitter)" },
						{ href: "mailto:ashvanikumar109@gmail.com", icon: "fa-regular fa-envelope", label: "Email" },
					].map((social) => (
						<li key={social.label} className="nav_item group relative">
							<a
								href={social.href}
								target={social.href.startsWith('mailto') ? undefined : "_blank"}
								rel={social.href.startsWith('mailto') ? undefined : "noopener noreferrer"}
								className="flex"
								aria-label={social.label}
							>
								<span className="text-white/40 group-hover:text-[#09090b] border border-white/10 group-hover:border-transparent w-[40px] h-[40px] rounded-full flex items-center justify-center overflow-hidden relative z-0 after:absolute after:inset-0 after:scale-0 after:bg-gradient-to-br after:from-[#00ff41] after:to-[#00cc88] group-hover:after:scale-100 after:transition-all after:duration-300 after:z-[-1] after:rounded-full transition-colors duration-300">
									<i className={social.icon} aria-hidden="true"></i>
								</span>
							</a>
						</li>
					))}
					<li className="nav_item group relative">
						<ShareButton isRound={true} />
					</li>
				</ul>
			</nav>
		</section>
	);
};

export default Hero8;
