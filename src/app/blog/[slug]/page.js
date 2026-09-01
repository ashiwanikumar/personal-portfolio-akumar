import Link from "next/link";
import { notFound } from "next/navigation";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import FaqList from "@/components/content/FaqList";
import ContentCard from "@/components/content/ContentCard";
import RelatedTerms from "@/components/content/RelatedTerms";
import { blogPosts, getBlogPost, getRelatedPosts } from "@/data/blog-posts";
import { getGlossaryTerm } from "@/data/glossary";
import { getGuide } from "@/data/guides";
import {
	generatePageMetadata,
	generateBlogPostingSchema,
	generateFAQSchema,
} from "@/libs/seo";

export function generateStaticParams() {
	return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const post = getBlogPost(slug);
	if (!post) return {};

	return generatePageMetadata({
		title: { absolute: `${post.seoTitle} | Ashiwani Kumar` },
		description: post.seoDescription,
		keywords: post.keywords,
		path: `/blog/${post.slug}`,
		ogImage: `https://ashiwanikumar.com${post.coverImage}`,
		ogType: "article",
		publishedTime: post.date,
		modifiedTime: post.lastUpdated,
	});
}

const formatDate = (d) =>
	new Date(d).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});

export default async function BlogPostPage({ params }) {
	const { slug } = await params;
	const post = getBlogPost(slug);
	if (!post) notFound();

	const related = getRelatedPosts(slug);
	const relatedTerms = (post.relatedTerms || []).map(getGlossaryTerm).filter(Boolean);
	const relatedGuides = (post.relatedGuides || []).map(getGuide).filter(Boolean);

	const jsonLd = [generateBlogPostingSchema(post)];
	if (post.faqs?.length) jsonLd.push(generateFAQSchema(post.faqs));

	return (
		<PageWrapper headerType={6} footerType={8}>
			<JsonLd data={jsonLd} />
			<main id="main-content" className="overflow-hidden pt-[140px] pb-[100px]">
				<div className="container">
					<article className="mx-auto max-w-[820px]">
						<Breadcrumbs
							items={[
								{ name: "Blog", url: "/blog" },
								{ name: post.title, url: `/blog/${post.slug}` },
							]}
						/>

						<div className="mb-5 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em]">
							<span className="rounded-full border border-[#00aaff]/30 px-4 py-1.5 text-[#00aaff]">
								{post.category}
							</span>
							<time dateTime={post.date} className="text-white/30">
								{formatDate(post.date)}
							</time>
							<span className="text-white/30">{post.readTime} read</span>
						</div>

						<h1 className="mb-6 text-[30px] font-bold uppercase leading-[1.12] tracking-[-0.03em] text-white sm:text-[38px] md:text-[44px]">
							{post.title}
						</h1>

						<p className="mb-10 rounded-2xl border border-[#00ff41]/20 bg-[#00ff41]/[0.04] p-6 text-[17px] leading-[1.8] text-white/75">
							{post.quickAnswer}
						</p>

						{post.keyTakeaways?.length ? (
							<section
								className="mb-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
								aria-labelledby="takeaways"
							>
								<h2
									id="takeaways"
									className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40"
								>
									Key takeaways
								</h2>
								<ul className="flex flex-col gap-3">
									{post.keyTakeaways.map((t) => (
										<li key={t} className="flex gap-3 text-[15px] leading-[1.75] text-white/60">
											<i
												className="fa-regular fa-check mt-1.5 shrink-0 text-[#00ff41]"
												aria-hidden="true"
											/>
											{t}
										</li>
									))}
								</ul>
							</section>
						) : null}

						{/* Trusted, author-written HTML from the content file — never user input. */}
						<div
							className="article-prose"
							dangerouslySetInnerHTML={{ __html: post.content }}
						/>

						<div className="mt-12 flex flex-wrap gap-2.5 border-t border-white/10 pt-8">
							{post.tags.map((tag) => (
								<span
									key={tag}
									className="rounded-full border border-white/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white/40"
								>
									{tag}
								</span>
							))}
						</div>

						<FaqList faqs={post.faqs} />

						<RelatedTerms terms={relatedTerms} heading="Terms in this article" />

						{relatedGuides.length ? (
							<section className="mt-14 border-t border-white/10 pt-10">
								<h2 className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
									Step-by-step guide
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

						{related.length ? (
							<section className="mt-14 border-t border-white/10 pt-10">
								<h2 className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
									Related Reading
								</h2>
								<div className="grid gap-5 sm:grid-cols-2">
									{related.map((p) => (
										<ContentCard
											key={p.slug}
											href={`/blog/${p.slug}`}
											eyebrow={p.category}
											title={p.title}
											description={p.excerpt}
											meta={[formatDate(p.date), p.readTime]}
										/>
									))}
								</div>
							</section>
						) : null}

						<p className="mt-12 border-t border-white/10 pt-8 text-sm text-white/40">
							Written by Ashiwani Kumar, Linux DevOps Engineer.{" "}
							<Link href="/about" className="text-[#00ff41] hover:underline">
								About me
							</Link>{" "}
							·{" "}
							<Link href="/blog" className="text-[#00ff41] hover:underline">
								All articles
							</Link>
						</p>
					</article>
				</div>
			</main>
		</PageWrapper>
	);
}
