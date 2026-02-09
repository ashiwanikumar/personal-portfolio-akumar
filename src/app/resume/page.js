import Resume7 from "@/components/sections/resume/Resume7";
import CVViewer from "@/components/sections/cv-viewer/CVViewer";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
	title: "Resume & CV - Professional Experience",
	description: "View and download Ashiwani Kumar's professional resume. Site Reliability Engineer with 7+ years managing infrastructure for aviation, healthcare, and telecommunications industries with 99.9% uptime achievement.",
	keywords: ["SRE Resume", "DevOps Experience", "Site Reliability Engineer CV", "Download CV", "Professional Experience", "UAE Work Experience", "Aviation Infrastructure", "Cloud Engineer Resume"],
	openGraph: {
		title: "Resume & CV | Ashiwani Kumar",
		description: "7+ years of DevOps and SRE experience managing mission-critical infrastructure across UAE airports and enterprise systems.",
		url: "https://ashiwanikumar.com/resume",
		type: "profile",
	},
	twitter: {
		title: "Resume & CV | Ashiwani Kumar",
		description: "Site Reliability Engineer with 7+ years experience in aviation, healthcare, and telecommunications.",
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
