import Link from "next/link";
import LegalPage, { EmailLink, LegalSection, Term, linkClass, listClass } from "@/components/legal/LegalPage";
import { generatePageMetadata } from "@/libs/seo";

export const metadata = generatePageMetadata({
	title: "Cookies Policy",
	description: "ashiwanikumar.com sets no cookies for visitors. The only cookies are sign-in cookies for the private admin dashboard, plus one session storage flag. Details here.",
	keywords: ["Cookies Policy", "Cookie Notice", "Website Cookies", "Cookieless Analytics", "Ashiwani Kumar Cookies"],
	path: "/cookies-policy",
});

const codeClass = "font-mono text-sm text-white/75";

export default function CookiesPolicy() {
	return (
		<LegalPage
			title="Cookies Policy"
			current="/cookies-policy"
			updated={{ iso: "2026-09-28", label: "28 September 2026" }}
			intro="Short version: if you are just reading this site, it doesn't set any cookies on your device, and there are no advertising or third-party tracking cookies."
		>
			<LegalSection id="what-are-cookies" title="What cookies are">
				<p>
					Cookies are small text files a website can store in your browser. Sites use them to keep you signed in, remember settings, or track visits. Browsers also offer similar storage, called local storage and session storage.
				</p>
			</LegalSection>

			<LegalSection id="visitors" title="If you are visiting the site">
				<p>
					No cookies are set. After a couple of minutes on the site a small box invites you to follow me on LinkedIn. Two values in your browser control when it shows. Neither is ever sent anywhere:
				</p>
				<ul className={listClass}>
					<li>
						<Term>
							<code className={codeClass}>linkedinModalSessionStart</code>
						</Term>{" "}
						in session storage: the time your visit started, so the box waits a couple of minutes across pages. Your browser deletes it when you close the tab.
					</li>
					<li>
						<Term>
							<code className={codeClass}>linkedinModalSnoozedUntil</code>
						</Term>{" "}
						in local storage: a date before which the box won&apos;t show again. Closing the box sets it 30 days ahead; following me on LinkedIn sets it a year ahead. You can clear it any time by clearing site data in your browser.
					</li>
				</ul>
				<p>
					Page views are measured with Vercel Web Analytics and Vercel Speed Insights, which work without cookies. The{" "}
					<Link href="/privacy-notice#what" className={linkClass}>Privacy Notice</Link>{" "}
					explains what they record.
				</p>
			</LegalSection>

			<LegalSection id="admin" title="If you sign in to the admin dashboard">
				<p>
					The site has a private dashboard that only I and other authorised users can sign in to. Signing in sets strictly necessary cookies that keep the session open:
				</p>
				<ul className={listClass}>
					<li><code className={codeClass}>cv_admin_access_token</code>: proves you are signed in</li>
					<li><code className={codeClass}>cv_admin_refresh_token</code>: renews the session when the access token expires</li>
					<li><code className={codeClass}>cv_admin_user</code>: basic details of the signed-in account used to render the dashboard</li>
				</ul>
				<p>
					These are removed when you sign out or when they expire. The dashboard also loads Cloudflare Turnstile to check that you are not a bot, and Cloudflare may process technical data for that check. None of this happens on the public pages.
				</p>
			</LegalSection>

			<LegalSection id="third-party" title="Third-party services">
				<p>
					The public pages don&apos;t embed third-party widgets, videos, social media buttons or ads. Links to LinkedIn, GitHub and other sites are plain links. Once you follow one, that site&apos;s own cookie policy applies.
				</p>
			</LegalSection>

			<LegalSection id="managing" title="Managing cookies and storage">
				<p>
					You can view and delete cookies and site data in your browser settings, or block them altogether. Blocking them has no effect on the public site. It will only stop the admin dashboard sign-in from working.
				</p>
			</LegalSection>

			<LegalSection id="changes" title="Changes">
				<p>
					If I add anything that uses cookies, I will update this page and the date at the top first.
				</p>
			</LegalSection>

			<LegalSection id="contact" title="Contact">
				<p>
					Questions about cookies on this site: <EmailLink />.
				</p>
			</LegalSection>
		</LegalPage>
	);
}
