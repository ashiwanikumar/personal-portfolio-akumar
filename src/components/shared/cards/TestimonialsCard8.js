const TestimonialsCard8 = ({ testimonial }) => {
	const { authorName, authorDesig, desc, img } = testimonial ? testimonial : {};
	return (
		<div className="glass-card px-6 py-8 lg:p-8 rounded-[24px] relative z-0 group h-full flex flex-col">
			<div className="relative z-10 flex flex-col flex-1">
				{/* Quote icon */}
				<div className="mb-6" aria-hidden="true">
					<div className="w-10 h-10 rounded-xl bg-[#00ff41]/10 flex items-center justify-center">
						<i className="fa-solid fa-quote-left text-[#00ff41] text-sm"></i>
					</div>
				</div>

				<blockquote className="text-white/50 text-base leading-1.8 mb-8 font-mono flex-1">
					{desc}
				</blockquote>

				<div className="pt-6 border-t border-[#00ff41]/15">
					<div className="flex gap-4 items-center">
						<div className="flex-shrink-0 w-12 h-12 p-0.5 rounded-full bg-gradient-to-br from-[#00ff41]/40 to-[#00aaff]/30">
							<img
								className="w-full h-full object-cover rounded-full"
								src={img}
								alt={`${authorName} - ${authorDesig}`}
							/>
						</div>
						<div>
							<h4 className="text-base text-white font-mono font-bold mb-0.5">
								{authorName}
							</h4>
							<p className="text-white/35 text-xs font-mono">{authorDesig}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TestimonialsCard8;
