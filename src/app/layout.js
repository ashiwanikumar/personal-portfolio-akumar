import { Suspense } from "react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./css/animate.min.css";
import "./css/backToTop.css";
import "./css/flaticon_gerold.css";
import "./css/font-awesome-pro.min.css";
import "./css/glightbox.min.css";
import "./css/nice-select2.css";
import "./css/odometer-theme-default.css";
import "./globals.css";

export const metadata = {
	metadataBase: new URL('https://ashiwanikumar.com'),
	title: {
		default: "Ashiwani Kumar | Site Reliability Engineer & DevOps Expert",
		template: "%s | Ashiwani Kumar"
	},
	description: "Site Reliability Engineer with 6+ years of experience managing mission-critical infrastructure across UAE. Expert in Kubernetes, AWS, Terraform, CI/CD, and DevSecOps practices with 99.9% uptime achievement.",
	keywords: ["DevOps Engineer", "Site Reliability Engineer", "SRE", "Kubernetes", "AWS", "Terraform", "CI/CD", "Cloud Infrastructure", "Abu Dhabi", "UAE", "Infrastructure Automation", "DevSecOps"],
	authors: [{ name: "Ashiwani Kumar", url: "https://ashiwanikumar.com" }],
	creator: "Ashiwani Kumar",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://ashiwanikumar.com",
		siteName: "Ashiwani Kumar - SRE & DevOps Engineer",
		title: "Ashiwani Kumar | Site Reliability Engineer & DevOps Expert",
		description: "Site Reliability Engineer with 6+ years experience. Expert in Kubernetes, AWS, Terraform, and building reliable infrastructure at scale.",
		images: [
			{
				url: "/img/og-image.png",
				width: 1200,
				height: 630,
				alt: "Ashiwani Kumar - Site Reliability Engineer"
			}
		]
	},
	twitter: {
		card: "summary_large_image",
		title: "Ashiwani Kumar | SRE & DevOps Expert",
		description: "Site Reliability Engineer with 6+ years experience managing mission-critical infrastructure across UAE.",
		creator: "@theashvanikumar",
		images: ["/img/og-image.png"]
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1
		}
	},
	verification: {
		google: "your-google-verification-code"
	}
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body
				className="font-sora hacker-theme overflow-x-hidden relative"
			>
				<Suspense fallback={<></>}>{children}</Suspense>
			</body>
		</html>
	);
}
