import Link from "next/link";
import { generatePageMetadata } from "@/libs/seo";

export const metadata = generatePageMetadata({
	title: "Terms and Conditions",
	description: "Terms and conditions for using Ashiwani Kumar's website ashiwanikumar.com. Read our terms of service, usage policy, and legal information.",
	keywords: ["Terms of Service", "Terms and Conditions", "Website Terms", "Legal", "Ashiwani Kumar Terms"],
	path: "/terms-and-conditions",
});

export default function TermsAndConditions() {
	return (
		<main className="min-h-screen bg-[#09090b] py-20">
			<div className="container max-w-4xl mx-auto px-4">
				<div className="mb-8">
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-[#00ff41] hover:text-[#00ff88] font-mono text-sm transition-all duration-300"
					>
						<i className="fa-solid fa-arrow-left"></i>
						Back to Home
					</Link>
				</div>

				<div className="bg-[#111113] border border-[#00ff41]/30 rounded-[30px] p-8 md:p-12">
					<h1 className="text-3xl md:text-4xl font-bold text-[#00ff41] mb-4 font-mono">
						Terms and Conditions
					</h1>
					<p className="text-[#00cc33]/70 font-mono text-sm mb-8">
						Last updated: February 2025
					</p>

					<div className="space-y-8 text-[#00cc33] font-mono">
						<section>
							<h2 className="text-xl font-bold text-[#00ff41] mb-4">Agreement to Terms</h2>
							<p className="leading-relaxed">
								By accessing and using this website (ashiwanikumar.com), you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, please do not use this website.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-bold text-[#00ff41] mb-4">Intellectual Property</h2>
							<p className="leading-relaxed">
								The content on this website, including text, graphics, logos, images, and code snippets, is the property of Ashiwani Kumar unless otherwise stated. You may not reproduce, distribute, or use any content without prior written permission.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-bold text-[#00ff41] mb-4">Use of Website</h2>
							<p className="leading-relaxed mb-4">
								You agree to use this website only for lawful purposes. You must not:
							</p>
							<ul className="list-disc list-inside space-y-2 ml-4">
								<li>Use the website in any way that violates applicable laws</li>
								<li>Attempt to gain unauthorized access to the website or its systems</li>
								<li>Interfere with the proper functioning of the website</li>
								<li>Transmit any malicious code or harmful content</li>
								<li>Use the website to send spam or unsolicited communications</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-bold text-[#00ff41] mb-4">Disclaimer</h2>
							<p className="leading-relaxed">
								The information on this website is provided "as is" without any warranties, express or implied. I make no representations about the accuracy, completeness, or suitability of the information. Any reliance you place on such information is at your own risk.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-bold text-[#00ff41] mb-4">Professional Services</h2>
							<p className="leading-relaxed">
								Information about my professional services is provided for informational purposes only. Any engagement for professional services will be subject to separate agreements and terms.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-bold text-[#00ff41] mb-4">External Links</h2>
							<p className="leading-relaxed">
								This website may contain links to external websites. I am not responsible for the content, privacy practices, or terms of any third-party websites. Accessing external links is at your own risk.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-bold text-[#00ff41] mb-4">Limitation of Liability</h2>
							<p className="leading-relaxed">
								To the fullest extent permitted by law, I shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of this website.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-bold text-[#00ff41] mb-4">Indemnification</h2>
							<p className="leading-relaxed">
								You agree to indemnify and hold harmless Ashiwani Kumar from any claims, damages, losses, or expenses arising from your use of this website or violation of these terms.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-bold text-[#00ff41] mb-4">Governing Law</h2>
							<p className="leading-relaxed">
								These terms shall be governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts in Abu Dhabi, UAE.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-bold text-[#00ff41] mb-4">Changes to Terms</h2>
							<p className="leading-relaxed">
								I reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on this page. Your continued use of the website constitutes acceptance of the revised terms.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-bold text-[#00ff41] mb-4">Contact</h2>
							<p className="leading-relaxed">
								If you have any questions about these Terms and Conditions, please contact me at{" "}
								<a href="mailto:ashvanikumar109@gmail.com" className="text-[#00ff88] hover:underline">
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
