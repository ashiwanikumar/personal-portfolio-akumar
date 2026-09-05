import About5 from "@/components/sections/about/About5";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/libs/seo";

export const metadata = generatePageMetadata({
	title: "About Me - Linux DevOps Engineer & SRE",
	description: "Seven years running the systems people only notice when they break \u2014 airport infrastructure, healthcare platforms and telecom backbones across the UAE.",
	keywords: ["About Ashiwani Kumar", "SRE Background", "DevOps Experience", "Linux DevOps Engineer UAE", "Cloud Infrastructure Expert", "Open Source Enthusiast", "Aviation Infrastructure", "Abu Dhabi Engineer", "Indian DevOps Engineer"],
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
			<main className="overflow-hidden pt-[140px]">
				<About5 />
			</main>
		</PageWrapper>
	);
}
