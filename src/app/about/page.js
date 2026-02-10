import About5 from "@/components/sections/about/About5";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
	title: "About Me - Site Reliability Engineer & DevOps Expert",
	description: "Ashiwani Kumar - Site Reliability Engineer with 7+ years of experience managing mission-critical infrastructure for 5 UAE airports serving 50M+ passengers. Expert in Kubernetes, OpenShift, AWS, Terraform, Ansible, and DevSecOps.",
	keywords: ["About Ashiwani Kumar", "SRE Background", "DevOps Experience", "Site Reliability Engineer UAE", "Cloud Infrastructure Expert", "Open Source Enthusiast", "Aviation Infrastructure", "Abu Dhabi Engineer", "Indian DevOps Engineer"],
	openGraph: {
		title: "About Ashiwani Kumar | Site Reliability Engineer",
		description: "Site Reliability Engineer with 7+ years experience managing critical aviation infrastructure for 5 UAE airports. Expert in Kubernetes, OpenShift, AWS, and DevSecOps.",
		url: "https://ashiwanikumar.com/about",
		type: "profile",
		images: [
			{
				url: "https://ashiwanikumar.com/img/hero/ashiwani.png",
				width: 1200,
				height: 630,
				alt: "Ashiwani Kumar - About Me"
			}
		]
	},
	twitter: {
		card: "summary_large_image",
		title: "About Ashiwani Kumar | SRE & DevOps Engineer",
		description: "Learn about my journey as a Site Reliability Engineer managing critical aviation infrastructure for 5 UAE airports.",
		images: ["https://ashiwanikumar.com/img/hero/ashiwani.png"]
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
