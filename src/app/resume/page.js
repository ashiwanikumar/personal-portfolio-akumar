import Resume7 from "@/components/sections/resume/Resume7";
import CVViewer from "@/components/sections/cv-viewer/CVViewer";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import { generatePageMetadata, generateResumeSchema, generateBreadcrumbSchema } from "@/libs/seo";
import resumeData from "../../../public/fakedata/resume.json";

export const metadata = generatePageMetadata({
	title: "Resume & CV - Professional Experience",
	description: "View and download Ashiwani Kumar's professional resume. Linux DevOps Engineer with 7+ years managing infrastructure for aviation (5 UAE airports), healthcare, and telecommunications industries. 99.9% uptime achievement, 500+ servers managed.",
	keywords: ["SRE Resume", "DevOps CV", "Linux DevOps Engineer CV", "Download CV", "Professional Experience", "UAE Work Experience", "Aviation Infrastructure Engineer", "Cloud Engineer Resume", "Kubernetes Expert Resume", "DevOps Engineer Abu Dhabi"],
	path: "/resume",
	ogType: "profile",
});

export default function ResumePage() {
	const experience = resumeData[0]?.resumeItems || [];
	const education = resumeData[1]?.resumeItems || [];
	const jsonLd = [
		generateResumeSchema(experience, education),
		generateBreadcrumbSchema([{ name: "Resume", url: "/resume" }]),
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
				<Resume7 />
				<CVViewer />
			</main>
		</PageWrapper>
	);
}
