"use client";

const PortfolioCard10 = ({ portfolio, idx }) => {
	const { title, img, desc, category, tags } = portfolio ? portfolio : {};
	return (
		<div className="flex flex-col md:flex-row md:[&:nth-child(2n)]:flex-row-reverse items-center gap-30px lg:gap-60px xl:gap-75px 2xl:gap-40 overflow-hidden group mb-60px md:mb-80px">
			<div className="glass-card p-4 md:p-6 w-full max-w-[645px] rounded-2xl relative overflow-hidden">
				<div className="rounded-xl overflow-hidden">
					<img
						src={img}
						className="w-full transition-transform duration-700 group-hover:scale-105"
						alt={`${title} - ${category} project by Ashiwani Kumar`}
					/>
				</div>
			</div>

			<div className="w-full max-w-[500px]">
				<div>
					<div className="flex items-center gap-4 mb-4" aria-hidden="true">
						<span className="font-mono text-sm text-[#34d399]/70">
							0{idx + 1}
						</span>
						<span className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-[#34d399]/40 to-transparent"></span>
						<span className="text-[#38bdf8] text-xs font-mono font-medium uppercase tracking-[0.16em]">
							{category}
						</span>
					</div>
					<h4 className="block text-2xl md:text-[28px] lg:text-[32px] text-white font-bold leading-[1.15] tracking-[-0.02em] mb-4 lg:mb-5">
						{title}
					</h4>

					<p className="block text-white/45 mb-6 text-[15px] leading-[1.75]">
						{desc}
					</p>

					{tags && tags.length > 0 && (
						<div className="flex flex-wrap gap-2" aria-label={`Technologies: ${tags.join(', ')}`}>
							{tags.map((tag, tagIdx) => (
								<span
									key={tagIdx}
									className="px-3 py-1.5 text-xs font-mono font-medium bg-white/[0.04] text-white/60 border border-white/10 rounded-full transition-colors duration-300 group-hover:border-[#10b981]/25 group-hover:text-[#34d399]"
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
