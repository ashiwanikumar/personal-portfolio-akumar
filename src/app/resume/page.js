import Resume7 from "@/components/sections/resume/Resume7";
import CVViewer from "@/components/sections/cv-viewer/CVViewer";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
	title: "Resume & CV - Professional Experience",
	description: "View and download Ashiwani Kumar's professional resume. Site Reliability Engineer with 7+ years managing infrastructure for aviation (5 UAE airports), healthcare, and telecommunications industries. 99.9% uptime achievement, 500+ servers managed.",
	keywords: ["SRE Resume", "DevOps CV", "Site Reliability Engineer CV", "Download CV", "Professional Experience", "UAE Work Experience", "Aviation Infrastructure Engineer", "Cloud Engineer Resume", "Kubernetes Expert Resume", "DevOps Engineer Abu Dhabi"],
	openGraph: {
		title: "Resume & CV | Ashiwani Kumar - Site Reliability Engineer",
		description: "7+ years of DevOps and SRE experience managing mission-critical infrastructure across UAE airports and enterprise systems. Download CV.",
		url: "https://ashiwanikumar.com/resume",
		type: "profile",
		images: [
			{
				url: "https://ashiwanikumar.com/img/hero/ashiwani.png",
				width: 1200,
				height: 630,
				alt: "Resume - Ashiwani Kumar"
			}
		]
	},
	twitter: {
		card: "summary_large_image",
		title: "Resume & CV | Ashiwani Kumar",
		description: "Site Reliability Engineer with 7+ years experience in aviation, healthcare, and telecommunications. Download CV.",
		images: ["https://ashiwanikumar.com/img/hero/ashiwani.png"]
	},
	alternates: {
		canonical: "https://ashiwanikumar.com/resume",
	},
};

export default function ResumePage() {
	return (
		<PageWrapper headerType={6} footerType={8}>
			<main className="overflow-hidden pt-[140px]">
				<Resume7 />
				<CVViewer />
			</main>
		</PageWrapper>
	);
}
