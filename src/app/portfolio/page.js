import Portfolio8 from "@/components/sections/portfolio/Portfolio8";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import { generatePageMetadata, generatePortfolioSchema, generateBreadcrumbSchema } from "@/libs/seo";
import portfolioData from "../../../public/fakedata/portfolio.json";

export const metadata = generatePageMetadata({
	title: "Portfolio - Featured DevOps & Infrastructure Projects",
	description: "Explore Ashiwani Kumar's DevOps and infrastructure projects including Kubernetes deployments, AWS cloud migrations, CI/CD pipeline implementations, Terraform IaC, and enterprise infrastructure automation for aviation and healthcare systems.",
	keywords: ["DevOps Projects", "Infrastructure Portfolio", "Kubernetes Projects", "Cloud Migration Case Studies", "CI/CD Implementation", "Aviation Infrastructure Projects", "Enterprise DevOps", "AWS Projects", "Terraform Projects", "OpenShift Deployments"],
	path: "/portfolio",
});

export default function PortfolioPage() {
	const jsonLd = [
		generatePortfolioSchema(portfolioData),
		generateBreadcrumbSchema([{ name: "Portfolio", url: "/portfolio" }]),
	];

	return (
		<PageWrapper headerType={6} footerType={8}>
			{jsonLd.map((schema, i) => (
				<script
					key={i}
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
				/>
			))}
			<main className="overflow-hidden pt-[140px]">
				<Portfolio8 />
			</main>
		</PageWrapper>
	);
}
