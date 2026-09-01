/**
 * Native <details> rather than a JS accordion: the answers are in the server HTML
 * either way, which is what the FAQPage schema has to match, and it costs no
 * client bundle.
 */
const FaqList = ({ faqs, heading = "Frequently Asked Questions" }) => {
	if (!faqs?.length) return null;

	return (
		<section className="mt-16" aria-labelledby="faq-heading">
			<h2
				id="faq-heading"
				className="text-2xl md:text-3xl font-bold uppercase tracking-[-0.02em] mb-8"
			>
				<span className="gradient-text">Frequently Asked</span>{" "}
				<span className="text-white">Questions</span>
			</h2>
			<div className="flex flex-col gap-3">
				{faqs.map((faq) => (
					<details
						key={faq.question}
						className="group rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4 transition-colors duration-300 hover:border-[#00ff41]/30"
					>
						<summary className="flex cursor-pointer items-start justify-between gap-4 list-none font-semibold text-white/90 marker:content-['']">
							<span>{faq.question}</span>
							<i
								className="fa-regular fa-plus mt-1 shrink-0 text-[#00ff41] transition-transform duration-300 group-open:rotate-45"
								aria-hidden="true"
							/>
						</summary>
						<p className="mt-4 text-[15px] leading-[1.8] text-white/55">
							{faq.answer}
						</p>
					</details>
				))}
			</div>
		</section>
	);
};

export default FaqList;
