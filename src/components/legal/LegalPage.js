import Link from "next/link";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

// Shared shell for /privacy-notice, /terms-and-conditions and /cookies-policy.
const POLICIES = [
	{ href: "/privacy-notice", label: "Privacy Notice" },
	{ href: "/cookies-policy", label: "Cookies Policy" },
	{ href: "/terms-and-conditions", label: "Terms and Conditions" },
];

export const CONTACT_EMAIL = "ashvanikumar109@gmail.com";

export const linkClass = "text-[#34d399] hover:text-[#6ee7b7] underline underline-offset-4 decoration-[#34d399]/40 hover:decoration-[#6ee7b7] transition-colors";

export const listClass = "list-disc pl-5 space-y-2 marker:text-[#10b981]/60";

export function EmailLink() {
	return (
		<a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
			{CONTACT_EMAIL}
		</a>
	);
}

export function LegalSection({ id, title, children }) {
	return (
		<section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-32">
			<h2 id={`${id}-heading`} className="text-xl font-semibold text-white mb-4 tracking-[-0.01em]">
				{title}
			</h2>
			<div className="space-y-4 leading-relaxed">{children}</div>
		</section>
	);
}

// A labelled term inside a list, e.g. "Contact form: ..."
export function Term({ children }) {
	return <span className="text-white/85 font-medium">{children}</span>;
}

export default function LegalPage({ title, current, updated, intro, children }) {
	return (
		<PageWrapper headerType={6} footerType={8}>
			<main id="main-content" className="overflow-hidden pt-[140px] pb-24 bg-[#09090b]">
				<div className="container max-w-3xl mx-auto px-4">
					<header className="mb-10">
						<span className="section-badge mb-6 inline-flex">Legal</span>
						<h1 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-[-0.02em]">
							{title}
						</h1>
						<p className="text-white/40 font-mono text-sm mb-6">
							Last updated: <time dateTime={updated.iso}>{updated.label}</time>
						</p>
						{intro && <p className="text-white/65 text-lg leading-relaxed">{intro}</p>}
					</header>

					<div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-12">
						<div className="space-y-10 text-white/60">{children}</div>
					</div>

					<nav aria-label="Other policies" className="mt-10">
						<p className="text-white/35 font-mono text-xs uppercase tracking-[0.16em] mb-4">Other policies</p>
						<ul className="flex flex-wrap gap-3">
							{POLICIES.filter((p) => p.href !== current).map((p) => (
								<li key={p.href}>
									<Link
										href={p.href}
										className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-[#10b981]/40 hover:bg-[#10b981]/5 text-sm transition-colors"
									>
										{p.label}
										<i className="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</main>
		</PageWrapper>
	);
}
