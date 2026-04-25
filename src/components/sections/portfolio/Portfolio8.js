"use client";
import PortfolioCard10 from "@/components/shared/cards/PortfolioCard10";
import getPortfolio from "@/libs/getPortfolio";

const Portfolio8 = () => {
	const portfolio = getPortfolio()?.slice(0, 4);

	return (
		<section id="portfolio" className="relative overflow-hidden" aria-labelledby="portfolio-heading">
			<div className="py-60px md:py-20 lg:py-30 relative">
				<div className="mesh-gradient" aria-hidden="true" />
				<div className="container relative z-10">
					<div className="mb-10 md:mb-50px xl:mb-60px text-center">
						<span className="section-badge mb-6 inline-flex">
							<i className="fa-solid fa-terminal text-xs" aria-hidden="true"></i>
							My Work
						</span>
						<h2 id="portfolio-heading" className="text-[26px] md:text-[32px] lg:text-[38px] xl:text-[44px] uppercase font-bold leading-1.2 -tracking-0.02em inline-block max-w-580px w-full">
							<span className="gradient-text">Featured</span>{" "}
							<span className="text-white">Projects</span>
						</h2>
					</div>
					<div className="flex flex-col gap-50px md:gap-0">
						{portfolio?.length
							? portfolio?.map((portfolioSingle, idx) => (
									<PortfolioCard10
										key={idx}
										portfolio={portfolioSingle}
										idx={idx}
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
