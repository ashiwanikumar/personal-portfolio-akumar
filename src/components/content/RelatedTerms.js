import Link from "next/link";

/**
 * Glossary cross-links. These exist as much for crawl depth as for readers —
 * without them the 50 glossary pages are orphans reachable only from the index.
 */
const RelatedTerms = ({ terms, heading = "Related Terms" }) => {
	if (!terms?.length) return null;

	return (
		<section className="mt-14 border-t border-white/10 pt-10">
			<h2 className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
				{heading}
			</h2>
			<ul className="flex flex-wrap gap-2.5">
				{terms.map((t) => (
					<li key={t.term}>
						<Link
							href={`/glossary/${t.term}`}
							className="inline-block rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition-all duration-300 hover:border-[#00ff41]/40 hover:text-[#00ff41]"
						>
							{t.name}
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
};

export default RelatedTerms;
