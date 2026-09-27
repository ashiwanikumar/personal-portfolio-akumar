const ServiceCard6 = ({ service, showTools = false, headingLevel = "h3" }) => {
	const { title, iconName, shortDesc, tools } = service || {};
	const Heading = headingLevel;
	return (
		<div className="glass-card rounded-2xl relative p-8 z-0 group h-full flex flex-col">
			<div className="mb-6">
				<span className="w-14 h-14 bg-[#10b981]/10 border border-[#10b981]/15 rounded-xl inline-flex justify-center items-center leading-1 transition-all duration-500 group-hover:bg-[#10b981]/15 group-hover:scale-105">
					<i
						className={`${iconName} text-xl text-[#34d399] leading-1 inline-flex transition-all duration-500`}
						aria-hidden="true"
					></i>
				</span>
			</div>
			<Heading className="text-lg md:text-xl font-semibold mb-3 leading-[1.3] tracking-[-0.01em] text-white">
				{title}
			</Heading>
			<p className="text-sm text-white/55 leading-[1.7]">
				{shortDesc}
			</p>
			{showTools && tools?.length ? (
				<ul className="mt-auto pt-6 flex flex-wrap gap-2" aria-label={`Tools I use for ${title}`}>
					{tools.map((tool) => (
						<li
							key={tool}
							className="text-xs font-medium text-[#34d399] bg-[#10b981]/10 border border-[#10b981]/15 rounded-full px-3 py-1"
						>
							{tool}
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
};

export default ServiceCard6;
