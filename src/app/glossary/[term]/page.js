import Link from "next/link";
import { notFound } from "next/navigation";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import FaqList from "@/components/content/FaqList";
import RelatedTerms from "@/components/content/RelatedTerms";
import {
	glossaryTerms,
	getGlossaryTerm,
	getRelatedTerms,
	getGlossaryTermsByCategory,
} from "@/data/glossary";
import {
	generatePageMetadata,
	generateDefinedTermSchema,
	generateFAQSchema,
	clampWords,
	DESCRIPTION_LIMIT,
} from "@/libs/seo";

export function generateStaticParams() {
	return glossaryTerms.map((t) => ({ term: t.term }));
}

/**
 * "SLI (Service Level Indicator)" is the display name, but "SLI" is what people
 * search and what keeps the title inside the SERP cut-off.
 */
function shortName(name) {
	return name.replace(/\s*\([^)]*\)/g, "").split("/")[0].trim();
}

/** Room left for the title once the layout appends " | Ashiwani Kumar". */
const TITLE_BUDGET = 60 - " | Ashiwani Kumar".length;

/**
 * Longer term names ("Principle of Least Privilege") blow past the SERP cut-off
 * once the brand suffix is appended, and fitTitle cannot help because there is no
 * separator to drop. Pick the most descriptive variant that still fits instead.
 */
function glossarySeoTitle(name) {
	const candidates = [
		`${name} Meaning in DevOps & SRE`,
		`${name} Meaning in DevOps`,
		`${name} Meaning & Example`,
		`${name} Meaning`,
	];
	return candidates.find((c) => c.length <= TITLE_BUDGET) ?? candidates.at(-1);
}

export async function generateMetadata({ params }) {
	const { term: slug } = await params;
	const term = getGlossaryTerm(slug);
	if (!term) return {};

	const name = shortName(term.name);
	return generatePageMetadata({
		title: glossarySeoTitle(name),
		description: clampWords(
			`${name} meaning: ${term.shortDefinition}`,
			DESCRIPTION_LIMIT
		),
		keywords: [
			name.toLowerCase(),
			`${name.toLowerCase()} meaning`,
			`${name.toLowerCase()} definition`,
			...(term.alsoKnownAs ?? []).map((a) => a.toLowerCase()),
			term.category.toLowerCase(),
			"devops glossary",
		],
		path: `/glossary/${term.term}`,
	});
}

export default async function GlossaryTermPage({ params }) {
	const { term: slug } = await params;
	const term = getGlossaryTerm(slug);
	if (!term) notFound();

	const related = getRelatedTerms(slug);
	const sameCategory = getGlossaryTermsByCategory(term.category)
		.filter((t) => t.term !== slug && !related.some((r) => r.term === t.term))
		.slice(0, 6);

	const jsonLd = [generateDefinedTermSchema(term)];
	if (term.faqs?.length) jsonLd.push(generateFAQSchema(term.faqs));

	return (
		<PageWrapper headerType={6} footerType={8}>
			<JsonLd data={jsonLd} />
			<main id="main-content" className="overflow-hidden pt-[140px] pb-[100px]">
				<div className="container">
					<div className="mx-auto max-w-[820px]">
						<Breadcrumbs
							items={[
								{ name: "Glossary", url: "/glossary" },
								{ name: shortName(term.name), url: `/glossary/${term.term}` },
							]}
						/>

						<span className="mb-5 inline-block rounded-full border border-[#00aaff]/30 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#00aaff]">
							{term.category}
						</span>

						<h1 className="mb-6 text-[30px] font-bold uppercase leading-[1.15] tracking-[-0.03em] text-white sm:text-[38px] md:text-[44px]">
							{term.name}
						</h1>

						{/* The lead paragraph doubles as the extractable definition for
						    answer engines, so it repeats shortDefinition verbatim. */}
						<p className="mb-10 rounded-2xl border border-[#00ff41]/20 bg-[#00ff41]/[0.04] p-6 text-[17px] leading-[1.8] text-white/75">
							{term.shortDefinition}
						</p>

						{term.alsoKnownAs?.length ? (
							<p className="mb-8 font-mono text-[13px] text-white/35">
								Also known as: {term.alsoKnownAs.join(", ")}
							</p>
						) : null}

						{term.keyFacts?.length ? (
							<section className="mb-10" aria-label="Key facts">
								<dl className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
									{term.keyFacts.map((f) => (
										<div key={f.label} className="bg-[#0b0b0e] p-5">
											<dt className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-white/35">
												{f.label}
											</dt>
											<dd className="text-[15px] leading-[1.6] text-white/75">
												{f.value}
											</dd>
										</div>
									))}
								</dl>
							</section>
						) : null}

						<div className="article-prose">
							{term.definition.map((p, i) => (
								<p key={i}>{p}</p>
							))}
						</div>

						{term.example ? (
							<section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
								<h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#00ff41]">
									In practice
								</h2>
								<p className="text-[16px] leading-[1.8] text-white/60">
									{term.example}
								</p>
							</section>
						) : null}

						<FaqList faqs={term.faqs} />

						<RelatedTerms terms={related} />
						<RelatedTerms terms={sameCategory} heading={`More in ${term.category}`} />

						<p className="mt-12 border-t border-white/10 pt-8 text-sm text-white/40">
							Browse the full{" "}
							<Link href="/glossary" className="text-[#00ff41] hover:underline">
								DevOps &amp; SRE glossary
							</Link>
							, or read the{" "}
							<Link href="/guides" className="text-[#00ff41] hover:underline">
								step-by-step guides
							</Link>
							.
						</p>
					</div>
				</div>
			</main>
		</PageWrapper>
	);
}
