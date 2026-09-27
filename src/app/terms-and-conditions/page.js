import Link from "next/link";
import LegalPage, { EmailLink, LegalSection, linkClass, listClass } from "@/components/legal/LegalPage";
import { generatePageMetadata } from "@/libs/seo";

export const metadata = generatePageMetadata({
	title: "Terms and Conditions",
	description: "Terms for using ashiwanikumar.com: content ownership, acceptable use, disclaimers, liability, and UAE governing law.",
	keywords: ["Terms of Service", "Terms and Conditions", "Website Terms", "Legal", "Ashiwani Kumar Terms"],
	path: "/terms-and-conditions",
});

export default function TermsAndConditions() {
	return (
		<LegalPage
			title="Terms and Conditions"
			current="/terms-and-conditions"
			updated={{ iso: "2025-02", label: "February 2025" }}
		>
			<LegalSection id="agreement" title="Agreement to terms">
				<p>
					By accessing and using this website (ashiwanikumar.com), you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, please do not use this website.
				</p>
			</LegalSection>

			<LegalSection id="intellectual-property" title="Intellectual property">
				<p>
					The content on this website, including text, graphics, logos, images, and code snippets, is the property of Ashiwani Kumar unless otherwise stated. You may not reproduce, distribute, or use any content without prior written permission.
				</p>
			</LegalSection>

			<LegalSection id="use" title="Use of the website">
				<p>You agree to use this website only for lawful purposes. You must not:</p>
				<ul className={listClass}>
					<li>Use the website in any way that violates applicable laws</li>
					<li>Attempt to gain unauthorized access to the website or its systems</li>
					<li>Interfere with the proper functioning of the website</li>
					<li>Transmit any malicious code or harmful content</li>
					<li>Use the website to send spam or unsolicited communications</li>
				</ul>
			</LegalSection>

			<LegalSection id="disclaimer" title="Disclaimer">
				<p>
					The information on this website is provided &ldquo;as is&rdquo; without any warranties, express or implied. I make no representations about the accuracy, completeness, or suitability of the information. Any reliance you place on such information is at your own risk.
				</p>
			</LegalSection>

			<LegalSection id="professional-services" title="Professional services">
				<p>
					Information about my professional services is provided for informational purposes only. Any engagement for professional services will be subject to separate agreements and terms.
				</p>
			</LegalSection>

			<LegalSection id="external-links" title="External links">
				<p>
					This website may contain links to external websites. I am not responsible for the content, privacy practices, or terms of any third-party websites. Accessing external links is at your own risk.
				</p>
			</LegalSection>

			<LegalSection id="liability" title="Limitation of liability">
				<p>
					To the fullest extent permitted by law, I shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of this website.
				</p>
			</LegalSection>

			<LegalSection id="indemnification" title="Indemnification">
				<p>
					You agree to indemnify and hold harmless Ashiwani Kumar from any claims, damages, losses, or expenses arising from your use of this website or violation of these terms.
				</p>
			</LegalSection>

			<LegalSection id="governing-law" title="Governing law">
				<p>
					These terms shall be governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts in Abu Dhabi, UAE.
				</p>
			</LegalSection>

			<LegalSection id="privacy" title="Privacy">
				<p>
					How the site handles personal data is described in the{" "}
					<Link href="/privacy-notice" className={linkClass}>Privacy Notice</Link> and the{" "}
					<Link href="/cookies-policy" className={linkClass}>Cookies Policy</Link>.
				</p>
			</LegalSection>

			<LegalSection id="changes" title="Changes to terms">
				<p>
					I reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on this page. Your continued use of the website constitutes acceptance of the revised terms.
				</p>
			</LegalSection>

			<LegalSection id="contact" title="Contact">
				<p>
					If you have any questions about these Terms and Conditions, please contact me at <EmailLink />.
				</p>
			</LegalSection>
		</LegalPage>
	);
}
