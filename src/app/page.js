import Index8Main from "@/components/layout/main/Index8Main";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import { generatePageMetadata } from "@/libs/seo";

export const metadata = generatePageMetadata({
	title: { absolute: "Ashiwani Kumar | Linux DevOps Engineer & DevOps Practitioner" },
	description: "Linux DevOps Engineer with 7+ years of experience managing mission-critical infrastructure for 5 UAE airports. Expert in Kubernetes, OpenShift, AWS, Terraform, Ansible, and DevSecOps with 99.9% uptime achievement.",
	keywords: ["DevOps Engineer UAE", "Linux DevOps Engineer", "SRE Abu Dhabi", "Kubernetes Expert", "OpenShift Specialist", "AWS Cloud Engineer", "Terraform IaC", "Ansible Automation", "CI/CD Pipeline", "DevSecOps", "Aviation Infrastructure", "Cloud Migration"],
});

export default function Home() {
	return (
		<PageWrapper isIndexPage={true} headerType={6} footerType={8}>
			<Index8Main />
		</PageWrapper>
	);
}
