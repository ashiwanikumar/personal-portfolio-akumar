import Cta5 from "@/components/sections/cta/Cta5";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import { generatePageMetadata } from "@/libs/seo";

export const metadata = generatePageMetadata({
	title: "Contact - Get In Touch",
	description: "Contact Ashiwani Kumar for DevOps consulting, cloud infrastructure projects, or SRE services. Based in Abu Dhabi, UAE. Available for freelance and full-time opportunities. Phone: +971 566182303 (UAE), +91 8770616837 (India).",
	keywords: ["Contact DevOps Engineer", "Hire SRE", "DevOps Consulting UAE", "Cloud Infrastructure Consulting", "Abu Dhabi DevOps", "Contact Ashiwani Kumar", "Freelance DevOps", "SRE Services UAE", "Kubernetes Consultant Contact"],
	path: "/contact",
});

export default function ContactPage() {
	return (
		<PageWrapper headerType={6} footerType={8}>
			<main className="overflow-hidden pt-[140px]">
				<Cta5 />
			</main>
		</PageWrapper>
	);
}
