import Services8 from "@/components/sections/services/Services8";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import { generatePageMetadata } from "@/libs/seo";

export const metadata = generatePageMetadata({
	title: "Services - DevOps & SRE Solutions",
	description: "Professional DevOps and Linux DevOps Engineering services including cloud infrastructure automation, Kubernetes deployment, CI/CD pipelines, Terraform IaC, Ansible automation, and 24/7 monitoring solutions. Based in UAE.",
	keywords: ["DevOps Services", "SRE Services", "Cloud Infrastructure Consulting", "Kubernetes Consulting UAE", "CI/CD Pipeline Services", "Infrastructure Automation", "Terraform Consulting", "AWS Solutions", "OpenShift Services", "DevSecOps Implementation", "Cloud Migration Services"],
	path: "/services",
});

export default function ServicesPage() {
	return (
		<PageWrapper headerType={6} footerType={8}>
			<main className="overflow-hidden pt-[140px]">
				<Services8 />
			</main>
		</PageWrapper>
	);
}
