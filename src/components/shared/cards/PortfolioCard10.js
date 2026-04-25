"use client";

const PortfolioCard10 = ({ portfolio, idx }) => {
	const { title, img, desc, category, tags } = portfolio ? portfolio : {};
	return (
		<div className="flex flex-col md:flex-row md:[&:nth-child(2n)]:flex-row-reverse items-center gap-30px lg:gap-60px xl:gap-75px 2xl:gap-40 overflow-hidden group mb-60px md:mb-80px">
			<div className="glass-card p-4 md:p-6 w-full max-w-[645px] rounded-[24px] relative overflow-hidden">
				<div className="rounded-[18px] overflow-hidden">
					<img
						src={img}
						className="w-full transition-transform duration-700 group-hover:scale-105"
						alt={`${title} - ${category} project by Ashiwani Kumar`}
					/>
				</div>
			</div>

			<div className="w-full max-w-[500px]">
				<div>
					<h6
						className="text-size-70 md:text-size-75 lg:text-size-100 xl:text-124 font-bold transition-all duration-500 [-webkit-text-fill-color:transparent] [-webkit-text-stroke:1px_rgba(0,255,65,0.2)] group-hover:[-webkit-text-stroke:1px_rgba(0,255,65,0.5)] opacity-50 group-hover:opacity-100 mb-10px lg:mb-15px xl:mb-25px leading-1"
						aria-hidden="true"
					>
						0{idx + 1}.
					</h6>
					<span className="text-[#00aaff] text-xs font-mono font-semibold uppercase tracking-[0.2em] mb-3 block">
						{category}
					</span>
					<h4 className="block text-2xl md:text-size-32 lg:text-size-40 xl:text-size-44 text-white font-bold leading-1.2 tracking-0.02em uppercase mb-4 lg:mb-6">
						{title}
					</h4>

					<p className="block text-white/40 mb-6 font-mono text-sm leading-relaxed">
						{desc}
					</p>

					{tags && tags.length > 0 && (
						<div className="flex flex-wrap gap-2" aria-label={`Technologies: ${tags.join(', ')}`}>
							{tags.map((tag, tagIdx) => (
								<span
									key={tagIdx}
									className="px-3 py-1.5 text-xs font-mono font-medium bg-[#00ff41]/8 text-[#00ff41] border border-[#00ff41]/20 rounded-full"
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
