import Portfolio8 from "@/components/sections/portfolio/Portfolio8";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
	title: "Portfolio - Featured DevOps Projects",
	description: "Explore my DevOps and infrastructure projects including Kubernetes deployments, cloud migrations, CI/CD implementations, and infrastructure automation for aviation and enterprise systems.",
	keywords: ["DevOps Projects", "Infrastructure Portfolio", "Kubernetes Projects", "Cloud Migration", "CI/CD Implementation", "Aviation Infrastructure", "Enterprise DevOps"],
	openGraph: {
		title: "DevOps Portfolio | Ashiwani Kumar",
		description: "Featured projects showcasing cloud infrastructure, Kubernetes deployments, and enterprise DevOps solutions.",
		url: "https://ashiwanikumar.com/portfolio",
		type: "website",
	},
	twitter: {
		title: "DevOps Portfolio | Ashiwani Kumar",
		description: "Explore featured DevOps and infrastructure projects including cloud migrations and Kubernetes deployments.",
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
