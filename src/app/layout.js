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
		default: "Ashiwani Kumar | Site Reliability Engineer & DevOps Practitioner",
		template: "%s | Ashiwani Kumar"
	},
	description: "Site Reliability Engineer with 7+ years of experience managing mission-critical infrastructure across UAE. Expert in Kubernetes, OpenShift, AWS, Terraform, Ansible, CI/CD, and DevSecOps practices with 99.9% uptime achievement.",
	keywords: ["DevOps Engineer", "Site Reliability Engineer", "SRE", "Kubernetes", "OpenShift", "AWS", "Terraform", "Ansible", "CI/CD", "Cloud Infrastructure", "Abu Dhabi", "UAE", "Infrastructure Automation", "DevSecOps", "Open Source", "Linux Administrator"],
	authors: [{ name: "Ashiwani Kumar", url: "https://ashiwanikumar.com" }],
	creator: "Ashiwani Kumar",
	publisher: "Ashiwani Kumar",
	formatDetection: {
		email: true,
		address: true,
		telephone: true,
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://ashiwanikumar.com",
		siteName: "Ashiwani Kumar - SRE & DevOps Engineer",
		title: "Ashiwani Kumar | Site Reliability Engineer & DevOps Practitioner",
		description: "Site Reliability Engineer with 7+ years experience. Expert in Kubernetes, OpenShift, AWS, Terraform, Ansible, and building reliable infrastructure at scale.",
		images: [
			{
				url: "https://ashiwanikumar.com/img/hero/ashiwani.png",
				width: 1200,
				height: 630,
				alt: "Ashiwani Kumar - Site Reliability Engineer & DevOps Practitioner"
			}
		]
	},
	twitter: {
		card: "summary_large_image",
		site: "@theashvanikumar",
		creator: "@theashvanikumar",
		title: "Ashiwani Kumar | SRE & DevOps Practitioner",
		description: "Site Reliability Engineer with 7+ years experience managing mission-critical infrastructure across UAE.",
		images: ["https://ashiwanikumar.com/img/hero/ashiwani.png"]
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
	alternates: {
		canonical: "https://ashiwanikumar.com",
	},
	verification: {
		google: "your-google-verification-code"
	},
	category: "technology",
	other: {
		"contact:email": "ashvanikumar109@gmail.com",
		"contact:phone:uae": "+971 566182303",
		"contact:phone:india": "+91 8770616837",
	}
};

// JSON-LD Structured Data
const jsonLd = {
	"@context": "https://schema.org",
	"@type": "Person",
	"name": "Ashiwani Kumar",
	"url": "https://ashiwanikumar.com",
	"image": "https://ashiwanikumar.com/img/hero/ashiwani.png",
	"jobTitle": "Site Reliability Engineer",
	"worksFor": {
		"@type": "Organization",
		"name": "Astek Middle East"
	},
	"description": "Site Reliability Engineer with 7+ years of experience managing mission-critical infrastructure across UAE airports.",
	"email": "ashvanikumar109@gmail.com",
	"telephone": "+971 566182303",
	"address": {
		"@type": "PostalAddress",
		"addressLocality": "Abu Dhabi",
		"addressCountry": "UAE"
	},
	"sameAs": [
		"https://www.linkedin.com/in/ashiwanikumar/",
		"https://github.com/ashiwanikumar",
		"https://x.com/theashvanikumar",
		"https://www.facebook.com/ashiwani0",
		"https://www.instagram.com/ashiwani0/"
	],
	"knowsAbout": [
		"Site Reliability Engineering",
		"DevOps",
		"Kubernetes",
		"OpenShift",
		"AWS",
		"Terraform",
		"Ansible",
		"CI/CD",
		"Cloud Infrastructure",
		"Linux Administration",
		"Docker",
		"Azure DevOps"
	]
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</head>
			<body
				className="font-sora hacker-theme overflow-x-hidden relative"
			>
				<Suspense fallback={<></>}>{children}</Suspense>
			</body>
		</html>
	);
}
