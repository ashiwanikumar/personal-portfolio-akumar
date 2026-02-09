import Services8 from "@/components/sections/services/Services8";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
	title: "Services - DevOps & SRE Solutions",
	description: "Professional DevOps and Site Reliability Engineering services including cloud infrastructure automation, Kubernetes deployment, CI/CD pipelines, infrastructure as code, and 24/7 monitoring solutions.",
	keywords: ["DevOps Services", "SRE Services", "Cloud Infrastructure", "Kubernetes Consulting", "CI/CD Pipeline", "Infrastructure Automation", "Terraform Services", "AWS Solutions"],
	openGraph: {
		title: "DevOps & SRE Services | Ashiwani Kumar",
		description: "Expert DevOps and Site Reliability Engineering services. Cloud automation, Kubernetes, CI/CD, and infrastructure management.",
		url: "https://ashiwanikumar.com/services",
		type: "website",
	},
	twitter: {
		title: "DevOps & SRE Services | Ashiwani Kumar",
		description: "Professional DevOps services including cloud infrastructure, Kubernetes, and CI/CD solutions.",
	},
	alternates: {
		canonical: "https://ashiwanikumar.com/services",
	},
};

export default function ServicesPage() {
	return (
		<PageWrapper headerType={6} footerType={8}>
			<main className="overflow-hidden pt-[140px]">
				<Services8 />
			</main>
		</PageWrapper>
	);
}
