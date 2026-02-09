"use client";

const PortfolioCard10 = ({ portfolio, idx }) => {
	const { title, img, desc, category, tags } = portfolio ? portfolio : {};
	return (
		<div className="flex flex-col md:flex-row md:[&:nth-child(2n)]:flex-row-reverse items-center gap-30px lg:gap-60px xl:gap-75px 2xl:gap-40 overflow-hidden group mb-60px md:mb-80px">
			<div
				className="branding p-15px md:p-30px bg-cream-light-color dark:bg-black-color w-full max-w-[645px] rounded-15px transition-all duration-300 relative wow zoomIn"
				data-wow-delay=".3s"
				data-tilt
			>
				<div className="rounded-15px overflow-hidden">
					<img src={img} className="transition-all duration-400 w-full" alt={title} />
				</div>
			</div>

			<div className="w-full max-w-[500px] wow fadeInUp" data-wow-delay=".3s">
				<div>
					<h6 className="text-size-70 md:text-size-75 lg:text-size-100 xl:text-124 font-bold transition-all duration-300 [-webkit-text-fill-color:transparent] [-webkit-text-stroke:1px_var(--primary-color)] dark:[-webkit-text-stroke:1px_var(--bg-color-2)] group-hover:[-webkit-text-stroke:1px_var(--primary-color)] dark:group-hover:[-webkit-text-stroke:1px_var(--primary-color)] opacity-30 dark:opacity-100 group-hover:opacity-100 mb-10px lg:mb-15px xl:mb-25px leading-1">
						0{idx + 1}.
					</h6>
					<span className="text-primary-color text-sm font-medium uppercase tracking-wider mb-2 block">
						{category}
					</span>
					<h4 className="block text-3xl md:text-size-32 lg:text-size-40 xl:text-size-44 text-seondary-color dark:text-white-color font-bold leading-1.2 tracking-0.02em uppercase mb-4 lg:mb-6">
						{title}
					</h4>

					<p className="block text-primary-color-light dark:text-gray-color-2 mb-5">
						{desc}
					</p>

					{tags && tags.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{tags.map((tag, tagIdx) => (
								<span
									key={tagIdx}
									className="px-3 py-1 text-xs font-medium bg-primary-color/10 text-primary-color rounded-full"
								>
									{tag}
								</span>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default PortfolioCard10;
