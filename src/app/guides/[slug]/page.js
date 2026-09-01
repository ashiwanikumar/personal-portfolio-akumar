import Link from "next/link";
import { notFound } from "next/navigation";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import FaqList from "@/components/content/FaqList";
import ContentCard from "@/components/content/ContentCard";
import RelatedTerms from "@/components/content/RelatedTerms";
import { guides, getGuide, getRelatedGuides } from "@/data/guides";
import { getGlossaryTerm } from "@/data/glossary";
import {
	generatePageMetadata,
	generateHowToSchema,
	generateFAQSchema,
} from "@/libs/seo";

export function generateStaticParams() {
	return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const guide = getGuide(slug);
	if (!guide) return {};

	return generatePageMetadata({
		title: { absolute: `${guide.seoTitle} | Ashiwani Kumar` },
		description: guide.seoDescription,
		keywords: guide.keywords,
		path: `/guides/${guide.slug}`,
		ogType: "article",
		publishedTime: guide.lastUpdated,
		modifiedTime: guide.lastUpdated,
	});
}

export default async function GuidePage({ params }) {
	const { slug } = await params;
	const guide = getGuide(slug);
	if (!guide) notFound();

	const relatedGuides = getRelatedGuides(slug);
	const relatedTerms = (guide.relatedTerms || []).map(getGlossaryTerm).filter(Boolean);

	const jsonLd = [generateHowToSchema(guide)];
	if (guide.faqs?.length) jsonLd.push(generateFAQSchema(guide.faqs));

	return (
		<PageWrapper headerType={6} footerType={8}>
			<JsonLd data={jsonLd} />
			<main id="main-content" className="overflow-hidden pt-[140px] pb-[100px]">
				<div className="container">
					<div className="mx-auto max-w-[860px]">
						<Breadcrumbs
							items={[
								{ name: "Guides", url: "/guides" },
								{ name: guide.title, url: `/guides/${guide.slug}` },
							]}
						/>

						<div className="mb-5 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em]">
							<span className="rounded-full border border-[#00aaff]/30 px-4 py-1.5 text-[#00aaff]">
								{guide.difficulty}
							</span>
							<span className="text-white/30">{guide.estimatedReadTime} read</span>
							<span className="text-white/30">
								Updated{" "}
								<time dateTime={guide.lastUpdated}>
									{new Date(guide.lastUpdated).toLocaleDateString("en-GB", {
										day: "numeric",
										month: "short",
										year: "numeric",
									})}
								</time>
							</span>
						</div>

						<h1 className="mb-6 text-[30px] font-bold uppercase leading-[1.12] tracking-[-0.03em] text-white sm:text-[38px] md:text-[44px]">
							{guide.title}
						</h1>

						<p className="mb-10 rounded-2xl border border-[#00ff41]/20 bg-[#00ff41]/[0.04] p-6 text-[17px] leading-[1.8] text-white/75">
							{guide.quickAnswer}
						</p>

						{guide.prerequisites?.length ? (
							<section className="mb-12" aria-labelledby="prereqs">
								<h2
									id="prereqs"
									className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40"
								>
									Before you start
								</h2>
								<ul className="flex flex-col gap-2.5">
									{guide.prerequisites.map((p) => (
										<li key={p} className="flex gap-3 text-[15px] leading-[1.7] text-white/55">
											<i
												className="fa-regular fa-check mt-1.5 shrink-0 text-[#00ff41]"
												aria-hidden="true"
											/>
											{p}
										</li>
									))}
								</ul>
							</section>
						) : null}

						<ol className="flex list-none flex-col gap-10">
							{guide.steps.map((step) => (
								<li key={step.step} id={`step-${step.step}`} className="scroll-mt-[120px]">
									<div className="mb-3 flex items-baseline gap-4">
										<span
											aria-hidden="true"
											className="font-mono text-[13px] font-bold text-[#00ff41]"
										>
											{String(step.step).padStart(2, "0")}
										</span>
										<h2 className="text-xl font-bold leading-snug text-white md:text-2xl">
											{step.title}
										</h2>
									</div>

									<div className="pl-0 sm:pl-[38px]">
										<p className="mb-5 text-[16px] leading-[1.8] text-white/55">
											{step.description}
										</p>

										{step.code ? (
											<pre className="mb-5 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-5">
												<code className="font-mono text-[13.5px] leading-[1.7] text-white/75">
													{step.code}
												</code>
											</pre>
										) : null}

										{step.tips?.map((tip) => (
											<p
												key={tip}
												className="mb-3 rounded-lg border-l-2 border-[#00aaff]/50 bg-[#00aaff]/[0.04] px-4 py-3 text-[14.5px] leading-[1.7] text-white/55"
											>
												<span className="font-mono text-[11px] uppercase tracking-wider text-[#00aaff]">
													Tip
												</span>
												<br />
												{tip}
											</p>
										))}

										{step.warnings?.map((warning) => (
											<p
												key={warning}
												className="mb-3 rounded-lg border-l-2 border-[#ffb020]/60 bg-[#ffb020]/[0.05] px-4 py-3 text-[14.5px] leading-[1.7] text-white/60"
											>
												<span className="font-mono text-[11px] uppercase tracking-wider text-[#ffb020]">
													Watch out
												</span>
												<br />
												{warning}
											</p>
										))}
									</div>
								</li>
							))}
						</ol>

						{guide.commonMistakes?.length ? (
							<section className="mt-16" aria-labelledby="mistakes">
								<h2
									id="mistakes"
									className="mb-8 text-2xl font-bold uppercase tracking-[-0.02em] md:text-3xl"
								>
									<span className="gradient-text">Common</span>{" "}
									<span className="text-white">Mistakes</span>
								</h2>
								<div className="flex flex-col gap-4">
									{guide.commonMistakes.map((m) => (
										<div
											key={m.mistake}
											className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
										>
											<h3 className="mb-3 font-bold text-white">{m.mistake}</h3>
											<p className="mb-3 text-[15px] leading-[1.75] text-white/50">
												<span className="font-mono text-[11px] uppercase tracking-wider text-[#ffb020]">
													Consequence
												</span>
												<br />
												{m.consequence}
											</p>
											<p className="text-[15px] leading-[1.75] text-white/60">
												<span className="font-mono text-[11px] uppercase tracking-wider text-[#00ff41]">
													Fix
												</span>
												<br />
												{m.solution}
											</p>
										</div>
									))}
								</div>
							</section>
						) : null}

						{guide.tools?.length ? (
							<section className="mt-16" aria-labelledby="tools">
								<h2
									id="tools"
									className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40"
								>
									Tools used
								</h2>
								<dl className="grid gap-4 sm:grid-cols-2">
									{guide.tools.map((t) => (
										<div
											key={t.name}
											className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
										>
											<dt className="mb-1.5 font-bold text-white">{t.name}</dt>
											<dd className="text-[14.5px] leading-[1.7] text-white/50">
												{t.description}
											</dd>
										</div>
									))}
								</dl>
							</section>
						) : null}

						<FaqList faqs={guide.faqs} />

						<RelatedTerms terms={relatedTerms} heading="Terms used in this guide" />

						{relatedGuides.length ? (
							<section className="mt-14 border-t border-white/10 pt-10">
								<h2 className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
									Related Guides
								</h2>
								<div className="grid gap-5 sm:grid-cols-2">
									{relatedGuides.map((g) => (
										<ContentCard
											key={g.slug}
											href={`/guides/${g.slug}`}
											eyebrow={g.difficulty}
											title={g.title}
											description={g.shortDescription}
											meta={[`${g.steps.length} steps`, g.estimatedReadTime]}
										/>
									))}
								</div>
							</section>
						) : null}

						<p className="mt-12 border-t border-white/10 pt-8 text-sm text-white/40">
							More in the{" "}
							<Link href="/guides" className="text-[#00ff41] hover:underline">
								guides index
							</Link>{" "}
							and on the{" "}
							<Link href="/blog" className="text-[#00ff41] hover:underline">
								blog
							</Link>
							.
						</p>
					</div>
				</div>
			</main>
		</PageWrapper>
	);
}
