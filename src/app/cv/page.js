import CVViewer from "@/components/sections/cv-viewer/CVViewer";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
	title: "Download CV - Ashiwani Kumar",
	description: "Download or view the detailed CV of Ashiwani Kumar, Site Reliability Engineer. Complete work history, certifications, technical skills, and achievements in DevOps and cloud infrastructure.",
	keywords: ["Download CV", "Ashiwani Kumar CV", "SRE CV Download", "DevOps Engineer Resume", "Professional CV", "Technical Skills"],
	openGraph: {
		title: "Download CV | Ashiwani Kumar",
		description: "Download my detailed CV with complete work history, certifications, and technical skills in DevOps and SRE.",
		url: "https://ashiwanikumar.com/cv",
		type: "profile",
	},
	twitter: {
		title: "Download CV | Ashiwani Kumar",
		description: "Download the complete CV of a Site Reliability Engineer with 7+ years of experience.",
	},
	alternates: {
		canonical: "https://ashiwanikumar.com/cv",
	},
};

export default function CVPage() {
	return (
		<PageWrapper headerType={6} footerType={8}>
			<main className="overflow-hidden pt-[140px]">
				<CVViewer />
			</main>
		</PageWrapper>
	);
}
