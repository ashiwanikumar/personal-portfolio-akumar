import Resume7 from "@/components/sections/resume/Resume7";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
	title: "Resume - Professional Experience & Skills",
	description: "View my professional experience as a Site Reliability Engineer across UAE and India. 7+ years managing infrastructure for aviation, healthcare, and telecommunications industries with 99.9% uptime achievement.",
	keywords: ["SRE Resume", "DevOps Experience", "Site Reliability Engineer CV", "Professional Experience", "UAE Work Experience", "Aviation Infrastructure", "Cloud Engineer Resume"],
	openGraph: {
		title: "Professional Resume | Ashiwani Kumar",
		description: "7+ years of DevOps and SRE experience managing mission-critical infrastructure across UAE airports and enterprise systems.",
		url: "https://ashiwanikumar.com/resume",
		type: "profile",
	},
	twitter: {
		title: "Professional Resume | Ashiwani Kumar",
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
			</main>
		</PageWrapper>
	);
}
