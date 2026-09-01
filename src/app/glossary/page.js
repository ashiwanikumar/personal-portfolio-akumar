import Link from "next/link";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import PageHeading from "@/components/content/PageHeading";
import { glossaryTerms, getGlossaryCategories, getGlossaryTermsByCategory } from "@/data/glossary";
import {
	generatePageMetadata,
	generateDefinedTermSetSchema,
	generateItemListSchema,
} from "@/libs/seo";

export const metadata = generatePageMetadata({
	title: "DevOps & SRE Glossary",
	description:
		"Plain-English definitions of Kubernetes, Terraform, CI/CD, and SRE terminology — written from production experience, not from documentation.",
	keywords: [
		"devops glossary",
		"sre glossary",
		"kubernetes terminology",
		"devops terms explained",
		"sre terms definitions",
	],
	path: "/glossary",
});

export default function GlossaryIndexPage() {
	const categories = getGlossaryCategories();

	const jsonLd = [
		generateDefinedTermSetSchema(glossaryTerms),
		generateItemListSchema({
			name: "DevOps & SRE Glossary",
			description: "Definitions of DevOps, Kubernetes, and SRE terminology.",
			path: "/glossary",
			items: glossaryTerms.map((t) => ({ name: t.name, url: `/glossary/${t.term}` })),
		}),
	];

	return (
		<PageWrapper headerType={6} footerType={8}>
			<JsonLd data={jsonLd} />
			<main id="main-content" className="overflow-hidden pt-[140px] pb-[100px]">
				<div className="container">
					<Breadcrumbs items={[{ name: "Glossary", url: "/glossary" }]} />

					<PageHeading
						eyebrow="Reference"
						titleAccent="DevOps & SRE"
						titleRest="Glossary"
						description="Definitions written from running this in production — what each term means, why it matters operationally, and the mistake people usually make with it."
						stats={[
							{ value: String(glossaryTerms.length), label: "Terms" },
							{ value: String(categories.length), label: "Categories" },
						]}
					/>

					{categories.map((category) => {
						const terms = getGlossaryTermsByCategory(category);
						return (
							<section key={category} className="mb-14" aria-labelledby={`cat-${category}`}>
								<h2
									id={`cat-${category}`}
									className="mb-6 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#00aaff]"
								>
									{category}
									<span className="h-px flex-1 bg-white/10" aria-hidden="true" />
									<span className="text-white/25">{terms.length}</span>
								</h2>
								<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{terms.map((t) => (
										<li key={t.term}>
											<Link
												href={`/glossary/${t.term}`}
												className="group flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-300 hover:border-[#00ff41]/40 hover:bg-white/[0.04]"
											>
												<h3 className="mb-2 font-bold text-white transition-colors duration-300 group-hover:text-[#00ff41]">
													{t.name}
												</h3>
												<p className="text-[14px] leading-[1.7] text-white/45">
													{t.shortDefinition}
												</p>
											</Link>
										</li>
									))}
								</ul>
							</section>
						);
					})}
				</div>
			</main>
		</PageWrapper>
	);
}
