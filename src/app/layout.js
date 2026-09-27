import { Suspense } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
	generatePersonSchema,
	generateWebSiteSchema,
	generateProfilePageSchema,
} from "@/libs/seo";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains",
	display: "swap",
});

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./css/backToTop.css";
import "./css/flaticon_gerold.css";
import "./css/font-awesome-pro.min.css";
import "./globals.css";

export const metadata = {
	metadataBase: new URL('https://ashiwanikumar.com'),
	title: {
		default: "Ashiwani Kumar | Linux DevOps & SRE Engineer",
		template: "%s | Ashiwani Kumar"
	},
	description: "Linux DevOps and SRE engineer in Abu Dhabi with 7+ years running mission-critical systems across the UAE at 99.9% uptime. Kubernetes, OpenShift, AWS, Terraform.",
	keywords: ["DevOps Engineer", "Linux DevOps Engineer", "SRE", "Kubernetes", "OpenShift", "AWS", "Terraform", "Ansible", "CI/CD", "Cloud Infrastructure", "Abu Dhabi", "UAE", "Infrastructure Automation", "DevSecOps", "Open Source", "Linux Administrator"],
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
		title: "Ashiwani Kumar | Linux DevOps & SRE Engineer",
		description: "Linux DevOps and SRE engineer in Abu Dhabi with 7+ years running mission-critical systems across the UAE. Kubernetes, OpenShift, AWS, Terraform, Ansible.",
		images: [
			{
				url: "https://ashiwanikumar.com/img/og-card.png",
				width: 1200,
				height: 630,
				alt: "Ashiwani Kumar, Linux DevOps & SRE Engineer"
			}
		]
	},
	twitter: {
		card: "summary_large_image",
		site: "@byteforge_ai",
		creator: "@byteforge_ai",
		title: "Ashiwani Kumar | Linux DevOps & SRE Engineer",
		description: "Linux DevOps and SRE engineer in Abu Dhabi with 7+ years running mission-critical systems across the UAE.",
		images: ["https://ashiwanikumar.com/img/og-card.png"]
	},
	robots: {
		index: true,
		follow: true,
		"max-snippet": -1,
		"max-image-preview": "large",
		"max-video-preview": -1,
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
	category: "technology",
	// Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION / _BING_ in the Vercel project.
	// Omitted entirely when unset, rather than emitting an empty meta tag.
	...((process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
		process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION) && {
		verification: {
			...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
				google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
			}),
			...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION && {
				other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION },
			}),
		},
	}),
	other: {
		"contact:email": "ashvanikumar109@gmail.com",
		"contact:phone:uae": "+971 566182303",
		"contact:phone:india": "+91 8770616837",
	}
};

export const viewport = {
	themeColor: "#09090b",
	colorScheme: "dark",
};

const jsonLdSchemas = [
	generatePersonSchema(),
	generateWebSiteSchema(),
	generateProfilePageSchema(),
];

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<head>
				{jsonLdSchemas.map((schema, i) => (
					<script
						key={i}
						type="application/ld+json"
						dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
					/>
				))}
			</head>
			<body
				className={`${inter.variable} ${jetbrainsMono.variable} font-sora hacker-theme overflow-x-hidden relative`}
			>
				<a href="#main-content" className="skip-to-content">
					Skip to main content
				</a>
				<Suspense fallback={<></>}>{children}</Suspense>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
