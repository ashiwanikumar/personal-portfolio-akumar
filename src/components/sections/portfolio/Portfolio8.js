"use client";
import PortfolioCard10 from "@/components/shared/cards/PortfolioCard10";
import getPortfolio from "@/libs/getPortfolio";

// isPage: this is the page heading on /portfolio (h1, cards h2); on the home
// page it sits under the hero's h1 (h2, cards h3).
const Portfolio8 = ({ isPage = false }) => {
	const TitleTag = isPage ? "h1" : "h2";
	const portfolio = getPortfolio()?.slice(0, 6);

	return (
		<section id="portfolio" className="relative overflow-hidden" aria-labelledby="portfolio-heading">
			<div className="py-60px md:py-20 lg:py-30 relative">
				<div className="mesh-gradient" aria-hidden="true" />
				<div className="container relative z-10">
					<div className="mb-10 md:mb-50px xl:mb-60px text-center">
						<span className="section-badge mb-6 inline-flex">Work</span>
						<TitleTag id="portfolio-heading" className="text-[26px] md:text-[30px] lg:text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] block max-w-580px w-full mx-auto text-white">
							Selected <span className="gradient-text">projects.</span>
						</TitleTag>
						<p className="text-white/45 text-base leading-[1.75] max-w-[520px] mx-auto mt-4">
							Infrastructure doesn&apos;t screenshot well, so I&apos;ve drawn what each
							project actually looked like.
						</p>
					</div>
					<div className="flex flex-col">
						{portfolio?.length
							? portfolio?.map((portfolioSingle, idx) => (
									<PortfolioCard10
										key={portfolioSingle.id ?? idx}
										portfolio={portfolioSingle}
										idx={idx}
										headingTag={isPage ? "h2" : "h3"}
									/>
							  ))
							: null}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Portfolio8;
