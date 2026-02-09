import About5 from "@/components/sections/about/About5";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
	title: "About Me - Site Reliability Engineer",
	description: "Learn about Ashiwani Kumar, a Site Reliability Engineer with 7+ years of experience managing mission-critical infrastructure for 5 UAE airports. Expert in Kubernetes, OpenShift, AWS, Terraform, and Ansible.",
	keywords: ["About Ashiwani Kumar", "SRE Background", "DevOps Experience", "Site Reliability Engineer UAE", "Cloud Infrastructure Expert", "Open Source Enthusiast"],
	openGraph: {
		title: "About Ashiwani Kumar | Site Reliability Engineer",
		description: "Site Reliability Engineer with 7+ years of experience. Expert in Kubernetes, OpenShift, AWS, Terraform, and building reliable infrastructure at scale.",
		url: "https://ashiwanikumar.com/about",
		type: "profile",
	},
	twitter: {
		title: "About Ashiwani Kumar | SRE & DevOps Engineer",
		description: "Learn about my journey as a Site Reliability Engineer managing critical aviation infrastructure.",
	},
	alternates: {
		canonical: "https://ashiwanikumar.com/about",
	},
};

export default function AboutPage() {
	return (
		<PageWrapper headerType={6} footerType={8}>
			<main className="overflow-hidden pt-[140px]">
				<About5 />
			</main>
		</PageWrapper>
	);
}
