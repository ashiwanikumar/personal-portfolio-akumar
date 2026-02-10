import Portfolio8 from "@/components/sections/portfolio/Portfolio8";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
	title: "Portfolio - Featured DevOps & Infrastructure Projects",
	description: "Explore Ashiwani Kumar's DevOps and infrastructure projects including Kubernetes deployments, AWS cloud migrations, CI/CD pipeline implementations, Terraform IaC, and enterprise infrastructure automation for aviation and healthcare systems.",
	keywords: ["DevOps Projects", "Infrastructure Portfolio", "Kubernetes Projects", "Cloud Migration Case Studies", "CI/CD Implementation", "Aviation Infrastructure Projects", "Enterprise DevOps", "AWS Projects", "Terraform Projects", "OpenShift Deployments"],
	openGraph: {
		title: "DevOps Portfolio | Ashiwani Kumar",
		description: "Featured projects showcasing cloud infrastructure, Kubernetes deployments, CI/CD pipelines, and enterprise DevOps solutions for aviation and healthcare.",
		url: "https://ashiwanikumar.com/portfolio",
		type: "website",
		images: [
			{
				url: "https://ashiwanikumar.com/img/hero/ashiwani.png",
				width: 1200,
				height: 630,
				alt: "DevOps Portfolio - Ashiwani Kumar"
			}
		]
	},
	twitter: {
		card: "summary_large_image",
		title: "DevOps Portfolio | Ashiwani Kumar",
		description: "Explore featured DevOps and infrastructure projects including cloud migrations, Kubernetes deployments, and CI/CD implementations.",
		images: ["https://ashiwanikumar.com/img/hero/ashiwani.png"]
	},
	alternates: {
		canonical: "https://ashiwanikumar.com/portfolio",
	},
};

export default function PortfolioPage() {
	return (
		<PageWrapper headerType={6} footerType={8}>
			<main className="overflow-hidden pt-[140px]">
				<Portfolio8 />
			</main>
		</PageWrapper>
	);
}
