import Cta5 from "@/components/sections/cta/Cta5";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import { generatePageMetadata } from "@/libs/seo";

export const metadata = generatePageMetadata({
	title: "Contact - DevOps, Cloud & SRE Work",
	description: "Get in touch with Ashiwani Kumar about DevOps, cloud infrastructure, Kubernetes, or SRE work. Based in Abu Dhabi, UAE. I usually reply within a day.",
	keywords: ["Contact DevOps Engineer", "Hire SRE", "DevOps Consulting UAE", "Cloud Infrastructure Consulting", "Abu Dhabi DevOps", "Contact Ashiwani Kumar", "Freelance DevOps", "SRE Services UAE", "Kubernetes Consultant Contact"],
	path: "/contact",
});

export default function ContactPage() {
	return (
		<PageWrapper headerType={6} footerType={8}>
			<main id="main-content" className="overflow-hidden pt-[140px]">
				<Cta5 headingLevel="h1" />
			</main>
		</PageWrapper>
	);
}
