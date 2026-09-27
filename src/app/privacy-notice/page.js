import Link from "next/link";
import LegalPage, { EmailLink, LegalSection, Term, linkClass, listClass } from "@/components/legal/LegalPage";
import { generatePageMetadata } from "@/libs/seo";

export const metadata = generatePageMetadata({
	title: "Privacy Notice",
	description: "What ashiwanikumar.com collects through the contact form, newsletter, CV downloads and Vercel analytics, who it is shared with, how long it is kept, and how to ask for it to be deleted.",
	keywords: ["Privacy Notice", "Privacy Policy", "Data Protection", "UAE PDPL", "Ashiwani Kumar Privacy"],
	path: "/privacy-notice",
});

export default function PrivacyNotice() {
	return (
		<LegalPage
			title="Privacy Notice"
			current="/privacy-notice"
			updated={{ iso: "2026-09-28", label: "28 September 2026" }}
			intro="This page explains what information this website collects about you, why, where it goes, and what you can ask me to do with it. I've tried to list everything the site actually does rather than use generic wording."
		>
			<LegalSection id="who" title="Who I am">
				<p>
					This is the personal website of Ashiwani Kumar, an individual based in Abu Dhabi, United Arab Emirates. There is no company behind it. I decide what data the site collects and I am the person responsible for it. You can reach me at <EmailLink />.
				</p>
			</LegalSection>

			<LegalSection id="what" title="What I collect and why">
				<p>You can browse the whole site without giving me your name or email. Data is collected in four situations:</p>

				<h3 className="text-base font-semibold text-white pt-2">1. When you send a message through the contact form</h3>
				<ul className={listClass}>
					<li><Term>What you type:</Term> your name, email address, the topic you pick and your message.</li>
					<li><Term>Sent along with it:</Term> your browser window size and time zone, plus technical details of the request (such as browser and device type, language and IP address).</li>
					<li><Term>Why:</Term> so I can read and reply to your message, and to help spot spam. You receive an automatic confirmation email and I receive a copy of your message by email.</li>
				</ul>

				<h3 className="text-base font-semibold text-white pt-2">2. When you subscribe to the newsletter</h3>
				<ul className={listClass}>
					<li><Term>What you type:</Term> your email address.</li>
					<li><Term>Sent along with it:</Term> your browser window size and technical details of the request (such as browser and device type and IP address). The IP address may be used to estimate an approximate location (country and city).</li>
					<li><Term>Why:</Term> to send you the newsletter and a confirmation email when you sign up.</li>
				</ul>

				<h3 className="text-base font-semibold text-white pt-2">3. When you view, download or open my CV</h3>
				<ul className={listClass}>
					<li>
						<Term>What is recorded:</Term> which action you took (view, download or open in a new tab), the page you were on, the page that referred you, any <code className="font-mono text-sm text-white/75">utm_source</code>, <code className="font-mono text-sm text-white/75">utm_medium</code> and <code className="font-mono text-sm text-white/75">utm_campaign</code> tags in the link, your screen resolution and browser language.
					</li>
					<li>
						<Term>Added by the server:</Term> your IP address, your browser&apos;s user-agent string (browser, operating system and device type), and an approximate location looked up from the IP address (country, region, city, rough coordinates, time zone and internet provider).
					</li>
					<li><Term>Why:</Term> to understand how many people look at my CV and roughly where that interest comes from. I don&apos;t use it to identify or contact you.</li>
				</ul>

				<h3 className="text-base font-semibold text-white pt-2">4. Every visit: site analytics and performance</h3>
				<ul className={listClass}>
					<li>
						The site uses <Term>Vercel Web Analytics</Term> and <Term>Vercel Speed Insights</Term>. They record which pages are visited, the referring site, browser, operating system, device type, country, and how quickly pages load. They do not use cookies. According to Vercel, visitors are counted using a hash of the request that is discarded after 24 hours, and IP addresses are not stored.
					</li>
					<li>
						Like any web host, Vercel also keeps standard server logs of requests (such as IP address, requested URL and time) to run and secure the service.
					</li>
				</ul>

				<p>
					The site does not use advertising, advertising trackers, Google Analytics or social media tracking pixels. For details on cookies and browser storage, see the{" "}
					<Link href="/cookies-policy" className={linkClass}>Cookies Policy</Link>.
				</p>
			</LegalSection>

			<LegalSection id="sharing" title="Who the data is shared with">
				<p>I don&apos;t sell or rent your information, and I don&apos;t share it for marketing. It only passes through the services needed to run the site:</p>
				<ul className={listClass}>
					<li><Term>Vercel:</Term> hosts the website and provides the analytics described above.</li>
					<li><Term>Zoho Mail:</Term> sends the contact confirmation, newsletter and notification emails.</li>
					<li><Term>IP geolocation services</Term> such as ip-api.com: receive an IP address and return an approximate location.</li>
					<li><Term>The server and database</Term> that run this site&apos;s backend, where form submissions, subscriber records and CV events are stored.</li>
				</ul>
				<p>
					Some of these providers process data outside the UAE. I may also disclose information if the law requires it.
				</p>
			</LegalSection>

			<LegalSection id="retention" title="How long I keep it">
				<ul className={listClass}>
					<li><Term>Contact messages:</Term> for as long as they are useful for our conversation or any work that follows from it.</li>
					<li><Term>Newsletter subscriptions:</Term> until you unsubscribe.</li>
					<li><Term>CV view and download records:</Term> kept for analysis.</li>
				</ul>
				<p>
					There is no automatic deletion schedule at the moment, so records stay until I remove them. If you want your data deleted sooner, email me and I will delete it.
				</p>
			</LegalSection>

			<LegalSection id="rights" title="Your rights">
				<p>
					Under the UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021) and similar laws elsewhere, you can ask me to:
				</p>
				<ul className={listClass}>
					<li>tell you what data I hold about you and give you a copy</li>
					<li>correct anything that is wrong</li>
					<li>delete your data</li>
					<li>stop or limit how I use it</li>
					<li>take you off the newsletter (just reply to any newsletter email or write to me)</li>
				</ul>
				<p>
					To do any of these, email <EmailLink /> from the address you used on the site, or tell me enough about your visit (for example the date you downloaded the CV) for me to find the record. If you are unhappy with how I handle your request, you can complain to the UAE Data Office.
				</p>
			</LegalSection>

			<LegalSection id="security" title="Security">
				<p>
					The site is served over HTTPS, and I view submissions and records through a sign-in protected admin dashboard. No system is perfectly secure, so please don&apos;t send sensitive personal information (such as ID numbers or passwords) through the contact form.
				</p>
			</LegalSection>

			<LegalSection id="children" title="Children">
				<p>
					This site is meant for recruiters, clients and other professionals. It isn&apos;t aimed at children, and I don&apos;t knowingly collect information from anyone under 18.
				</p>
			</LegalSection>

			<LegalSection id="changes" title="Changes to this notice">
				<p>
					If the site starts collecting something new or I change how data is used, I will update this page and the date at the top.
				</p>
			</LegalSection>

			<LegalSection id="contact" title="Contact">
				<p>
					Questions about this notice or your data: <EmailLink />.
				</p>
			</LegalSection>
		</LegalPage>
	);
}
