import Cta5 from "@/components/sections/cta/Cta5";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
	title: "Contact - Get In Touch",
	description: "Contact Ashiwani Kumar for DevOps consulting, cloud infrastructure projects, or SRE services. Based in Abu Dhabi, UAE. Available for freelance and full-time opportunities.",
	keywords: ["Contact DevOps Engineer", "Hire SRE", "DevOps Consulting UAE", "Cloud Infrastructure Consulting", "Abu Dhabi DevOps", "Contact Ashiwani Kumar"],
	openGraph: {
		title: "Contact Ashiwani Kumar | DevOps & SRE",
		description: "Get in touch for DevOps consulting, cloud infrastructure, and Site Reliability Engineering services.",
		url: "https://ashiwanikumar.com/contact",
		type: "website",
	},
	twitter: {
		title: "Contact Ashiwani Kumar | DevOps & SRE",
		description: "Reach out for DevOps and cloud infrastructure consulting services.",
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
