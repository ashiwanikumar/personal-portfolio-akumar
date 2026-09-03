const ServiceCard6 = ({ service, idx }) => {
	const { title, iconName, shortDesc } = service || {};
	return (
		<div className="glass-card rounded-2xl relative p-8 z-0 group h-full">
			<div className="mb-6">
				<span className="w-14 h-14 bg-[#10b981]/10 border border-[#10b981]/15 rounded-xl inline-flex justify-center items-center leading-1 transition-all duration-500 group-hover:bg-[#10b981]/15 group-hover:scale-105">
					<i
						className={`${iconName} text-xl text-[#34d399] leading-1 inline-flex transition-all duration-500`}
						aria-hidden="true"
					></i>
				</span>
			</div>
			<h3 className="text-lg md:text-xl font-semibold mb-3 leading-[1.3] tracking-[-0.01em] text-white">
				{title}
			</h3>
			<p className="text-sm text-white/45 leading-[1.7]">
				{shortDesc}
			</p>
		</div>
	);
};

export default ServiceCard6;
