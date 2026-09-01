import { getBlogSlugs, blogPosts } from "@/data/blog-posts";
import { getGuideSlugs, guides } from "@/data/guides";
import { getGlossaryTermSlugs } from "@/data/glossary";

const baseUrl = "https://ashiwanikumar.com";

/**
 * Content dates come from the data files, so adding a post or a guide updates
 * its own lastmod. Static pages keep a stable date — a lastmod that moves on
 * every build is noise crawlers learn to ignore.
 */
const STATIC_UPDATED = "2026-08-20T00:00:00.000Z";
const LEGAL_UPDATED = "2026-01-01T00:00:00.000Z";

const iso = (d) => new Date(d).toISOString();

export default function sitemap() {
	const staticPages = [
		{ path: "", changeFrequency: "weekly", priority: 1.0 },
		{ path: "/about", changeFrequency: "monthly", priority: 0.9 },
		{ path: "/services", changeFrequency: "monthly", priority: 0.9 },
		{ path: "/portfolio", changeFrequency: "monthly", priority: 0.9 },
		{ path: "/resume", changeFrequency: "monthly", priority: 0.9 },
		{ path: "/contact", changeFrequency: "monthly", priority: 0.8 },
	].map((p) => ({
		url: `${baseUrl}${p.path}`,
		lastModified: STATIC_UPDATED,
		changeFrequency: p.changeFrequency,
		priority: p.priority,
	}));

	const hubs = [
		{ path: "/blog", priority: 0.9 },
		{ path: "/guides", priority: 0.9 },
		{ path: "/glossary", priority: 0.8 },
	].map((p) => ({
		url: `${baseUrl}${p.path}`,
		lastModified: STATIC_UPDATED,
		changeFrequency: "weekly",
		priority: p.priority,
	}));

	const posts = getBlogSlugs().map((slug) => {
		const post = blogPosts.find((p) => p.slug === slug);
		return {
			url: `${baseUrl}/blog/${slug}`,
			lastModified: iso(post.lastUpdated || post.date),
			changeFrequency: "monthly",
			priority: 0.8,
		};
	});

	const guidePages = getGuideSlugs().map((slug) => {
		const guide = guides.find((g) => g.slug === slug);
		return {
			url: `${baseUrl}/guides/${slug}`,
			lastModified: iso(guide.lastUpdated),
			changeFrequency: "monthly",
			priority: 0.8,
		};
	});

	const glossaryPages = getGlossaryTermSlugs().map((slug) => ({
		url: `${baseUrl}/glossary/${slug}`,
		lastModified: STATIC_UPDATED,
		changeFrequency: "monthly",
		priority: 0.6,
	}));

	const legalPages = [
		"/privacy-notice",
		"/terms-and-conditions",
		"/cookies-policy",
	].map((path) => ({
		url: `${baseUrl}${path}`,
		lastModified: LEGAL_UPDATED,
		changeFrequency: "yearly",
		priority: 0.3,
	}));

	return [
		...staticPages,
		...hubs,
		...posts,
		...guidePages,
		...glossaryPages,
		...legalPages,
	];
}
