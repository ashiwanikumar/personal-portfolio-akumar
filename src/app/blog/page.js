import Link from "next/link";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import PageHeading from "@/components/content/PageHeading";
import ContentCard from "@/components/content/ContentCard";
import { getAllBlogPosts, getBlogCategories } from "@/data/blog-posts";
import { generatePageMetadata, generateItemListSchema, AUTHOR } from "@/libs/seo";

export const metadata = generatePageMetadata({
	title: "DevOps & SRE Blog",
	description:
		"Notes from production: Kubernetes troubleshooting, CPU throttling, OpenShift, Terraform, Linux hardening, and making error budgets work.",
	keywords: [
		"devops blog",
		"sre blog",
		"kubernetes troubleshooting",
		"linux devops engineer blog",
		"platform engineering blog",
	],
	path: "/blog",
});

export default function BlogIndexPage() {
	const posts = getAllBlogPosts();
	const categories = getBlogCategories();

	const jsonLd = [
		{
			"@context": "https://schema.org",
			"@type": "Blog",
			name: "Ashiwani Kumar — DevOps & SRE Blog",
			description:
				"Production notes on Kubernetes, Terraform, OpenShift, Linux, and SRE practice.",
			url: "https://ashiwanikumar.com/blog",
			author: AUTHOR,
			inLanguage: "en-US",
		},
		generateItemListSchema({
			name: "DevOps & SRE Blog",
			description: "Articles on Kubernetes, Terraform, OpenShift, Linux, and SRE.",
			path: "/blog",
			items: posts.map((p) => ({ name: p.title, url: `/blog/${p.slug}` })),
		}),
	];

	return (
		<PageWrapper headerType={6} footerType={8}>
			<JsonLd data={jsonLd} />
			<main id="main-content" className="overflow-hidden pt-[140px] pb-[100px]">
				<div className="container">
					<Breadcrumbs items={[{ name: "Blog", url: "/blog" }]} />

					<PageHeading
						eyebrow="Writing"
						titleAccent="DevOps & SRE"
						titleRest="Blog"
						description="Things I have had to work out in production — what broke, why, and what I changed. No tutorials copied from documentation."
						stats={[
							{ value: String(posts.length), label: "Articles" },
							{ value: String(categories.length), label: "Topics" },
						]}
					/>

					<div className="grid gap-6 md:grid-cols-2">
						{posts.map((p) => (
							<ContentCard
								key={p.slug}
								href={`/blog/${p.slug}`}
								eyebrow={p.category}
								title={p.title}
								description={p.excerpt}
								meta={[
									new Date(p.date).toLocaleDateString("en-GB", {
										day: "numeric",
										month: "short",
										year: "numeric",
									}),
									p.readTime,
								]}
							/>
						))}
					</div>

					<p className="mt-14 border-t border-white/10 pt-8 text-sm text-white/40">
						Looking for something shorter? The{" "}
						<Link href="/glossary" className="text-[#00ff41] hover:underline">
							DevOps &amp; SRE glossary
						</Link>{" "}
						defines the terminology, and the{" "}
						<Link href="/guides" className="text-[#00ff41] hover:underline">
							guides
						</Link>{" "}
						walk through full procedures.
					</p>
				</div>
			</main>
		</PageWrapper>
	);
}
