import Services8 from "@/components/sections/services/Services8";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
	title: "Services - DevOps & SRE Solutions",
	description: "Professional DevOps and Site Reliability Engineering services including cloud infrastructure automation, Kubernetes deployment, CI/CD pipelines, Terraform IaC, Ansible automation, and 24/7 monitoring solutions. Based in UAE.",
	keywords: ["DevOps Services", "SRE Services", "Cloud Infrastructure Consulting", "Kubernetes Consulting UAE", "CI/CD Pipeline Services", "Infrastructure Automation", "Terraform Consulting", "AWS Solutions", "OpenShift Services", "DevSecOps Implementation", "Cloud Migration Services"],
	openGraph: {
		title: "DevOps & SRE Services | Ashiwani Kumar",
		description: "Expert DevOps and Site Reliability Engineering services. Cloud automation, Kubernetes deployment, CI/CD pipelines, and infrastructure management.",
		url: "https://ashiwanikumar.com/services",
		type: "website",
		images: [
			{
				url: "https://ashiwanikumar.com/img/hero/ashiwani.png",
				width: 1200,
				height: 630,
				alt: "DevOps & SRE Services - Ashiwani Kumar"
			}
		]
	},
	twitter: {
		card: "summary_large_image",
		title: "DevOps & SRE Services | Ashiwani Kumar",
		description: "Professional DevOps services including cloud infrastructure, Kubernetes deployment, and CI/CD pipeline solutions.",
		images: ["https://ashiwanikumar.com/img/hero/ashiwani.png"]
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
