import Services8 from "@/components/sections/services/Services8";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import { generatePageMetadata, generateServicesSchema, generateBreadcrumbSchema } from "@/libs/seo";
import servicesData from "../../../public/fakedata/services.json";

export const metadata = generatePageMetadata({
	title: "Services - DevOps & SRE Solutions",
	description: "Professional DevOps and Linux DevOps Engineering services including cloud infrastructure automation, Kubernetes deployment, CI/CD pipelines, Terraform IaC, Ansible automation, and 24/7 monitoring solutions. Based in UAE.",
	keywords: ["DevOps Services", "SRE Services", "Cloud Infrastructure Consulting", "Kubernetes Consulting UAE", "CI/CD Pipeline Services", "Infrastructure Automation", "Terraform Consulting", "AWS Solutions", "OpenShift Services", "DevSecOps Implementation", "Cloud Migration Services"],
	path: "/services",
});

export default function ServicesPage() {
	const jsonLd = [
		generateServicesSchema(servicesData),
		generateBreadcrumbSchema([{ name: "Services", url: "/services" }]),
	];

	return (
		<PageWrapper headerType={6} footerType={8}>
			{jsonLd.map((schema, i) => (
				<script
					key={i}
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
				/>
			))}
			<main className="overflow-hidden pt-[140px]">
				<Services8 />
			</main>
		</PageWrapper>
	);
}
