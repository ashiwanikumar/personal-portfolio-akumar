import Link from "next/link";
import { generatePageMetadata } from "@/libs/seo";

export const metadata = generatePageMetadata({
	title: "Privacy Notice",
	description: "Privacy notice explaining how Ashiwani Kumar collects, uses, and protects your personal information on ashiwanikumar.com. Your privacy matters.",
	keywords: ["Privacy Policy", "Privacy Notice", "Data Protection", "GDPR", "Ashiwani Kumar Privacy"],
	path: "/privacy-notice",
});

export default function PrivacyNotice() {
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
						Privacy Notice
					</h1>
					<p className="text-white/35 font-mono text-sm mb-8">
						Last updated: February 2025
					</p>

					<div className="space-y-8 text-white/55">
						<section>
							<h2 className="text-xl font-semibold text-white mb-4">Introduction</h2>
							<p className="leading-relaxed">
								This privacy notice explains how I, Ashiwani Kumar, collect, use, and protect your personal information when you visit my website ashiwanikumar.com. I am committed to protecting your privacy and handling your data transparently.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-white mb-4">Information I Collect</h2>
							<p className="leading-relaxed mb-4">
								I may collect the following types of information:
							</p>
							<ul className="list-disc list-inside space-y-2 ml-4">
								<li><span className="text-[#34d399]">Contact Information:</span> Name and email address when you contact me</li>
								<li><span className="text-[#34d399]">Usage Data:</span> Information about how you use the website</li>
								<li><span className="text-[#34d399]">Technical Data:</span> IP address, browser type, device information</li>
								<li><span className="text-[#34d399]">Communication Data:</span> Messages you send through contact forms</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-white mb-4">How I Use Your Information</h2>
							<p className="leading-relaxed mb-4">
								Your information is used for:
							</p>
							<ul className="list-disc list-inside space-y-2 ml-4">
								<li>Responding to your inquiries and messages</li>
								<li>Improving the website and user experience</li>
								<li>Analyzing website traffic and usage patterns</li>
								<li>Sending newsletters (only if you subscribe)</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-white mb-4">Data Sharing</h2>
							<p className="leading-relaxed">
								I do not sell, trade, or rent your personal information to third parties. I may share data with trusted service providers who assist in operating the website, subject to confidentiality agreements.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-white mb-4">Data Security</h2>
							<p className="leading-relaxed">
								I implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-white mb-4">Your Rights</h2>
							<p className="leading-relaxed mb-4">
								You have the right to:
							</p>
							<ul className="list-disc list-inside space-y-2 ml-4">
								<li>Access your personal data</li>
								<li>Correct inaccurate data</li>
								<li>Request deletion of your data</li>
								<li>Object to processing of your data</li>
								<li>Withdraw consent at any time</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-white mb-4">Data Retention</h2>
							<p className="leading-relaxed">
								I retain your personal information only for as long as necessary to fulfill the purposes outlined in this privacy notice, unless a longer retention period is required by law.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-white mb-4">Changes to This Notice</h2>
							<p className="leading-relaxed">
								I may update this privacy notice from time to time. Any changes will be posted on this page with an updated revision date.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
							<p className="leading-relaxed">
								If you have any questions about this privacy notice or wish to exercise your rights, please contact me at{" "}
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
