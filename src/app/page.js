import Index8Main from "@/components/layout/main/Index8Main";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
	title: "Ashiwani Kumar | Site Reliability Engineer & DevOps Practitioner",
	description: "Site Reliability Engineer with 7+ years of experience managing mission-critical infrastructure for 5 UAE airports. Expert in Kubernetes, OpenShift, AWS, Terraform, Ansible, and DevSecOps with 99.9% uptime achievement.",
	keywords: ["DevOps Engineer UAE", "Site Reliability Engineer", "SRE Abu Dhabi", "Kubernetes Expert", "OpenShift Specialist", "AWS Cloud Engineer", "Terraform IaC", "Ansible Automation", "CI/CD Pipeline", "DevSecOps", "Aviation Infrastructure", "Cloud Migration"],
	openGraph: {
		title: "Ashiwani Kumar | Site Reliability Engineer & DevOps Practitioner",
		description: "Site Reliability Engineer with 7+ years experience managing mission-critical infrastructure for 5 UAE airports. Expert in Kubernetes, AWS, Terraform, and DevSecOps.",
		url: "https://ashiwanikumar.com",
		type: "website",
		images: [
			{
				url: "https://ashiwanikumar.com/img/hero/ashiwani.png",
				width: 1200,
				height: 630,
				alt: "Ashiwani Kumar - Site Reliability Engineer"
			}
		]
	},
	twitter: {
		card: "summary_large_image",
		title: "Ashiwani Kumar | SRE & DevOps Practitioner",
		description: "Site Reliability Engineer with 7+ years experience. Kubernetes, AWS, Terraform, and DevSecOps expert.",
		images: ["https://ashiwanikumar.com/img/hero/ashiwani.png"]
	},
	alternates: {
		canonical: "https://ashiwanikumar.com",
	},
};

export default function Home() {
	return (
		<PageWrapper isIndexPage={true} headerType={6} footerType={8}>
			<Index8Main />
		</PageWrapper>
	);
}
