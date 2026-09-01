import Link from "next/link";

/** Shared card for blog, guide, and glossary listings and cross-links. */
const ContentCard = ({ href, eyebrow, title, description, meta }) => (
	<Link
		href={href}
		className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-300 hover:border-[#00ff41]/40 hover:bg-white/[0.04]"
	>
		{eyebrow && (
			<span className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[#00aaff]">
				{eyebrow}
			</span>
		)}
		<h3 className="mb-3 text-lg font-bold leading-snug text-white transition-colors duration-300 group-hover:text-[#00ff41]">
			{title}
		</h3>
		<p className="mb-5 flex-1 text-[15px] leading-[1.75] text-white/50">
			{description}
		</p>
		{meta?.length ? (
			<div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-white/30">
				{meta.map((m, i) => (
					<span key={m} className="flex items-center gap-3">
						{i > 0 && <span aria-hidden="true" className="text-white/15">•</span>}
						{m}
					</span>
				))}
			</div>
		) : null}
	</Link>
);

export default ContentCard;
