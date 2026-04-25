const ServiceCard6 = ({ service, idx }) => {
	const { title, iconName, shortDesc } = service || {};
	return (
		<div className="glass-card rounded-[24px] relative p-8 text-center z-0 group h-full">
			<div className="mb-6">
				<span className="w-16 h-16 bg-gradient-to-br from-[#00ff41]/20 to-[#00aaff]/10 rounded-2xl inline-flex justify-center items-center leading-1 transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-5deg]">
					<i
						className={`${iconName} text-2xl text-[#00ff41] leading-1 inline-flex transition-all duration-500`}
						aria-hidden="true"
					></i>
				</span>
			</div>
			<h3 className="text-xl sm:text-size-22 md:text-2xl font-bold mb-3 leading-1.2 tracking-0.02em text-white">
				{title}
			</h3>
			<p className="text-sm text-white/40 leading-1.7">
				{shortDesc}
			</p>
		</div>
	);
};

export default ServiceCard6;
