const baseUrl = "https://ashiwanikumar.com";

// Stable dates rather than new Date(), which would move on every build and
// become noise crawlers learn to ignore. Update when the page content changes.
const CONTENT_UPDATED = "2026-08-20T00:00:00.000Z";
const LEGAL_UPDATED = "2026-01-01T00:00:00.000Z";

export default function sitemap() {
	const pages = [
		{ path: "", changeFrequency: "weekly", priority: 1.0 },
		{ path: "/about", changeFrequency: "monthly", priority: 0.9 },
		{ path: "/services", changeFrequency: "monthly", priority: 0.9 },
		{ path: "/portfolio", changeFrequency: "monthly", priority: 0.9 },
		{ path: "/resume", changeFrequency: "monthly", priority: 0.9 },
		{ path: "/contact", changeFrequency: "monthly", priority: 0.8 },
	].map((p) => ({
		url: `${baseUrl}${p.path}`,
		lastModified: CONTENT_UPDATED,
		changeFrequency: p.changeFrequency,
		priority: p.priority,
	}));

	const legal = [
		"/privacy-notice",
		"/terms-and-conditions",
		"/cookies-policy",
	].map((path) => ({
		url: `${baseUrl}${path}`,
		lastModified: LEGAL_UPDATED,
		changeFrequency: "yearly",
		priority: 0.3,
	}));

	return [...pages, ...legal];
}
