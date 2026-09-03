import Link from "next/link";
import { generatePageMetadata } from "@/libs/seo";

export const metadata = generatePageMetadata({
	title: "Cookies Policy",
	description: "Learn how ashiwanikumar.com uses cookies and similar technologies. Understand your choices regarding cookies and tracking.",
	keywords: ["Cookies Policy", "Cookie Notice", "Website Cookies", "Tracking Technologies", "Ashiwani Kumar Cookies"],
	path: "/cookies-policy",
});

export default function CookiesPolicy() {
	return (
		<main className="min-h-screen bg-[#09090b] py-20">
			<div className="container max-w-4xl mx-auto px-4">
				<div className="mb-8">
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium transition-all duration-300"
					>
						<i className="fa-solid fa-arrow-left"></i>
						Back to Home
					</Link>
				</div>

				<div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-12">
					<h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-[-0.02em]">
						Cookies Policy
					</h1>
					<p className="text-white/35 font-mono text-sm mb-8">
						Last updated: February 2025
					</p>

					<div className="space-y-8 text-white/55">
						<section>
							<h2 className="text-xl font-semibold text-white mb-4">What Are Cookies</h2>
							<p className="leading-relaxed">
								Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-white mb-4">How We Use Cookies</h2>
							<p className="leading-relaxed mb-4">
								This website uses cookies for the following purposes:
							</p>
							<ul className="list-disc list-inside space-y-2 ml-4">
								<li><span className="text-[#34d399]">Essential Cookies:</span> Required for the website to function properly</li>
								<li><span className="text-[#34d399]">Analytics Cookies:</span> Help us understand how visitors interact with our website</li>
								<li><span className="text-[#34d399]">Preference Cookies:</span> Remember your settings and preferences</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-white mb-4">Third-Party Cookies</h2>
							<p className="leading-relaxed">
								We may use third-party services that set their own cookies, including:
							</p>
							<ul className="list-disc list-inside space-y-2 ml-4 mt-4">
								<li>Google Analytics - for website traffic analysis</li>
								<li>LinkedIn - for social media integration</li>
								<li>GitHub - for repository embeds</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-white mb-4">Managing Cookies</h2>
							<p className="leading-relaxed">
								You can control and manage cookies in various ways. Most browsers allow you to:
							</p>
							<ul className="list-disc list-inside space-y-2 ml-4 mt-4">
								<li>View and delete cookies</li>
								<li>Block third-party cookies</li>
								<li>Block all cookies from specific sites</li>
								<li>Block all cookies from being set</li>
								<li>Delete all cookies when you close your browser</li>
							</ul>
							<p className="leading-relaxed mt-4">
								Please note that blocking cookies may impact your experience on this website.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
							<p className="leading-relaxed">
								If you have any questions about our use of cookies, please contact me at{" "}
								<a href="mailto:ashvanikumar109@gmail.com" className="text-[#34d399] hover:underline">
									ashvanikumar109@gmail.com
								</a>
							</p>
						</section>
					</div>
				</div>
			</div>
		</main>
	);
}
