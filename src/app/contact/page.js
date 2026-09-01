import Cta5 from "@/components/sections/cta/Cta5";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import { generatePageMetadata } from "@/libs/seo";

export const metadata = generatePageMetadata({
	title: "Contact - Get In Touch",
	description: "Get in touch about DevOps consulting, cloud infrastructure, or SRE work. Based in Abu Dhabi, UAE, and available for contract and full-time opportunities.",
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
