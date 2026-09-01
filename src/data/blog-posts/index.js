import { blogPosts } from "./data";

export { blogPosts };

/** Newest first — the order the index page and sitemap both use. */
export const getAllBlogPosts = () =>
	[...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));

export const getBlogPost = (slug) => blogPosts.find((p) => p.slug === slug);

export const getBlogSlugs = () => blogPosts.map((p) => p.slug);

export const getBlogCategories = () =>
	Array.from(new Set(blogPosts.map((p) => p.category))).sort();

export const getRelatedPosts = (slug) => {
	const post = getBlogPost(slug);
	if (!post) return [];
	return (post.relatedSlugs || []).map(getBlogPost).filter(Boolean);
};
