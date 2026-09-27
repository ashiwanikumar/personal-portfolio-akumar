import About5 from "@/components/sections/about/About5";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/libs/seo";

export const metadata = generatePageMetadata({
	title: "About Me - Linux DevOps Engineer & SRE",
	description: "Linux DevOps Engineer in Abu Dhabi with 7+ years in production infrastructure, now on airport systems for 50M+ passengers a year. Kubernetes, OpenShift, AWS.",
	keywords: ["About Ashiwani Kumar", "Linux DevOps Engineer UAE", "DevOps Engineer Abu Dhabi", "SRE Background", "Aviation Infrastructure", "Kubernetes OpenShift Engineer", "RHCE AZ-400 Certified"],
	path: "/about",
	ogType: "profile",
});

export default function AboutPage() {
	const jsonLd = generateBreadcrumbSchema([{ name: "About", url: "/about" }]);

	return (
		<PageWrapper headerType={6} footerType={8}>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<main id="main-content" className="overflow-hidden pt-[140px]">
				<About5 isPage />
			</main>
		</PageWrapper>
	);
}
