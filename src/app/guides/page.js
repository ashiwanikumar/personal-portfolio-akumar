import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import PageHeading from "@/components/content/PageHeading";
import ContentCard from "@/components/content/ContentCard";
import { guides } from "@/data/guides";
import { generatePageMetadata, generateItemListSchema } from "@/libs/seo";

export const metadata = generatePageMetadata({
	title: "DevOps Guides — Kubernetes, Terraform & SRE",
	description:
		"Step-by-step operational guides for Kubernetes production readiness, zero-downtime deployments, Terraform remote state, and SLO burn-rate alerting.",
	keywords: [
		"devops guides",
		"kubernetes guide",
		"terraform guide",
		"sre guides",
		"kubernetes production checklist",
	],
	path: "/guides",
});

export default function GuidesIndexPage() {
	const jsonLd = generateItemListSchema({
		name: "DevOps & SRE Guides",
		description: "Step-by-step operational guides for Kubernetes, Terraform, and SRE practice.",
		path: "/guides",
		items: guides.map((g) => ({ name: g.title, url: `/guides/${g.slug}` })),
	});

	return (
		<PageWrapper headerType={6} footerType={8}>
			<JsonLd data={jsonLd} />
			<main id="main-content" className="overflow-hidden pt-[140px] pb-[100px]">
				<div className="container">
					<Breadcrumbs items={[{ name: "Guides", url: "/guides" }]} />

					<PageHeading
						eyebrow="Step by step"
						titleAccent="DevOps"
						titleRest="Guides"
						description="Procedures I actually run, written out in full — with the commands, the mistakes worth avoiding, and why each step is there."
						stats={[
							{ value: String(guides.length), label: "Guides" },
							{
								value: String(guides.reduce((a, g) => a + g.steps.length, 0)),
								label: "Steps",
							},
						]}
					/>

					<div className="grid gap-6 md:grid-cols-2">
						{guides.map((g) => (
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
				</div>
			</main>
		</PageWrapper>
	);
}
