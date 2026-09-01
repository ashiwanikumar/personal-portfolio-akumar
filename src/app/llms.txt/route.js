import { getAllBlogPosts } from "@/data/blog-posts";
import { guides } from "@/data/guides";
import { glossaryTerms, getGlossaryCategories, getGlossaryTermsByCategory } from "@/data/glossary";

const SITE = "https://ashiwanikumar.com";

/**
 * Generated rather than hand-maintained, so adding a post or a glossary term
 * shows up here automatically. The static public/llms.txt it replaced went stale
 * the moment content was added.
 */
export function GET() {
	const posts = getAllBlogPosts();

	const lines = [
		"# Ashiwani Kumar — Linux DevOps Engineer & SRE Practitioner",
		"",
		"> Personal site of Ashiwani Kumar, a Linux DevOps Engineer based in Abu Dhabi, UAE.",
		"> 7+ years managing mission-critical infrastructure for aviation systems serving 50M+",
		"> passengers annually across 5 UAE airports, at 99.9% uptime.",
		"",
		"## About",
		"",
		"Specialises in Kubernetes and OpenShift orchestration, AWS cloud infrastructure,",
		"Terraform, Ansible, CI/CD pipeline design, DevSecOps, and Linux administration.",
		"Currently at Astek Middle East.",
		"",
		`- [About](${SITE}/about): Background, experience, and technical focus`,
		`- [Services](${SITE}/services): DevOps and infrastructure engineering services`,
		`- [Portfolio](${SITE}/portfolio): Kubernetes migration, CI/CD automation, AWS IaC, SRE`,
		`- [Resume](${SITE}/resume): Full professional history`,
		`- [Contact](${SITE}/contact): Get in touch`,
		"",
		"## Articles",
		"",
		"Production notes on Kubernetes, Terraform, OpenShift, Linux, and SRE practice.",
		"",
		...posts.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}): ${p.seoDescription}`),
		"",
		"## Guides",
		"",
		"Step-by-step operational procedures.",
		"",
		...guides.map((g) => `- [${g.title}](${SITE}/guides/${g.slug}): ${g.seoDescription}`),
		"",
		"## Glossary",
		"",
		`${glossaryTerms.length} DevOps and SRE terms defined at ${SITE}/glossary`,
		"",
		...getGlossaryCategories().flatMap((category) => [
			`### ${category}`,
			"",
			...getGlossaryTermsByCategory(category).map(
				(t) => `- [${t.name}](${SITE}/glossary/${t.term}): ${t.shortDefinition}`
			),
			"",
		]),
		"## Contact",
		"",
		"- Email: ashvanikumar109@gmail.com",
		"- LinkedIn: https://www.linkedin.com/in/ashiwanikumar/",
		"- GitHub: https://github.com/ashiwanikumar",
		"- X: https://x.com/theashvanikumar",
		"",
	];

	return new Response(lines.join("\n"), {
		headers: {
			"content-type": "text/plain; charset=utf-8",
			"cache-control": "public, max-age=3600, s-maxage=86400",
		},
	});
}
