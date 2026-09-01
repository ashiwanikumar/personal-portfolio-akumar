import { guides } from "./data";

export { guides };

export const getGuide = (slug) => guides.find((g) => g.slug === slug);

export const getGuideSlugs = () => guides.map((g) => g.slug);

export const getRelatedGuides = (slug) => {
	const guide = getGuide(slug);
	if (!guide) return [];
	return (guide.relatedGuides || []).map(getGuide).filter(Boolean);
};
