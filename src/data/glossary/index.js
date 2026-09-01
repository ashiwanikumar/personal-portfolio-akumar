import { glossaryTerms } from "./data";

export { glossaryTerms };

export const getGlossaryTerm = (slug) =>
	glossaryTerms.find((g) => g.term === slug);

export const getGlossaryTermSlugs = () => glossaryTerms.map((g) => g.term);

export const getGlossaryCategories = () =>
	Array.from(new Set(glossaryTerms.map((g) => g.category))).sort();

export const getGlossaryTermsByCategory = (category) =>
	glossaryTerms.filter((g) => g.category === category);

/** Terms this one links to, resolved and with dangling slugs dropped. */
export const getRelatedTerms = (slug) => {
	const term = getGlossaryTerm(slug);
	if (!term) return [];
	return (term.relatedTerms || [])
		.map(getGlossaryTerm)
		.filter(Boolean);
};
