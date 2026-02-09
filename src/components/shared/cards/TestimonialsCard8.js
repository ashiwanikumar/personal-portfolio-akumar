const TestimonialsCard8 = ({ testimonial }) => {
	const { authorName, authorDesig, desc, img } = testimonial ? testimonial : {};
	return (
		<div className="px-15px py-30px lg:p-30px bg-[#002200] border border-[#00ff41]/30 hover:border-[#00ff41] transition-all duration-500 rounded-[30px] relative z-0 group">
			<div className="relative z-10">
				<div className="icon-box mb-5 md:mb-10 flex gap-1">
					<span className="text-[#00ff41] text-2xl font-mono">&quot;</span>
					<span className="text-[#00ff41] text-2xl font-mono">&quot;</span>
				</div>

				<p className="text-[#00cc33] text-base sm:text-lg leading-1.8 sm:leading-1.8 lg:leading-1.8 mb-30px font-mono">
					{desc}
				</p>
				<div className="pt-25px border-t border-[#00ff41]/30">
					<div className="flex gap-15px items-center">
						<div className="flex-shrink-0 w-16 h-16 p-1 border border-[#00ff41]/50 rounded-full">
							<img
								className="w-full h-full object-cover rounded-full"
								src={img}
								alt={authorName}
							/>
						</div>
						<div>
							<h4 className="text-lg lg:text-xl text-[#00ff41] mb-1 font-mono font-bold">
								{authorName}
							</h4>
							<p className="text-[#00cc33]/80 text-sm font-mono">{authorDesig}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TestimonialsCard8;
