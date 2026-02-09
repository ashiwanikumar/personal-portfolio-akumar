const ServiceCard6 = ({ service, idx }) => {
	const { title, iconName, shortDesc } = service || {};
	return (
		<div className="rounded-[30px] relative p-30px bg-white-color dark:bg-dark-color backdrop-blur-[40px] border border-border-color dark:border-transparent text-center z-0 group transition-all duration-500 h-full">
			<div className="mb-35px">
				<span className="w-16 h-16 bg-gradient-secondary bg-200 rounded-100% inline-flex justify-center items-center leading-1">
					<i
						className={`${iconName} text-size-34 text-white-color leading-1 inline-flex transition-all duration-500 group-hover:scale-x-[-1]`}
					></i>
				</span>
			</div>
			<h3 className="tj-service-5-accordion-list-title text-xl sm:text-size-22 md:text-3xl font-bold mb-15px leading-1.2 md:leading-1.2 tracking-0.02em transition-all duration-300 ease-in relative">
				<span className="text-seondary-color dark:text-white-color">
					{title}
				</span>
			</h3>
			<p className="text-base xl:text-size-15 2xl:text-base text-primary-color-light dark:text-gray-color-2 leading-1.5 2xl:leading-1.5">
				{shortDesc}
			</p>
		</div>
	);
};

export default ServiceCard6;
