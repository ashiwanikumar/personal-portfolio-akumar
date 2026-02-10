import Cta5 from "@/components/sections/cta/Cta5";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
	title: "Contact - Get In Touch",
	description: "Contact Ashiwani Kumar for DevOps consulting, cloud infrastructure projects, or SRE services. Based in Abu Dhabi, UAE. Available for freelance and full-time opportunities. Phone: +971 566182303 (UAE), +91 8770616837 (India).",
	keywords: ["Contact DevOps Engineer", "Hire SRE", "DevOps Consulting UAE", "Cloud Infrastructure Consulting", "Abu Dhabi DevOps", "Contact Ashiwani Kumar", "Freelance DevOps", "SRE Services UAE", "Kubernetes Consultant Contact"],
	openGraph: {
		title: "Contact Ashiwani Kumar | DevOps & SRE Engineer",
		description: "Get in touch for DevOps consulting, cloud infrastructure, and Site Reliability Engineering services. Based in Abu Dhabi, UAE.",
		url: "https://ashiwanikumar.com/contact",
		type: "website",
		images: [
			{
				url: "https://ashiwanikumar.com/img/hero/ashiwani.png",
				width: 1200,
				height: 630,
				alt: "Contact Ashiwani Kumar"
			}
		]
	},
	twitter: {
		card: "summary_large_image",
		title: "Contact Ashiwani Kumar | DevOps & SRE",
		description: "Reach out for DevOps and cloud infrastructure consulting services. Based in Abu Dhabi, UAE.",
		images: ["https://ashiwanikumar.com/img/hero/ashiwani.png"]
	},
	alternates: {
		canonical: "https://ashiwanikumar.com/contact",
	},
};

export default function ContactPage() {
	return (
		<PageWrapper headerType={6} footerType={8}>
			<main className="overflow-hidden pt-[140px]">
				<Cta5 />
			</main>
		</PageWrapper>
	);
}
