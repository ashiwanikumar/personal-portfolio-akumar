import Link from "next/link";
import { generateBreadcrumbSchema } from "@/libs/seo";

/**
 * Visible breadcrumb trail plus the matching BreadcrumbList schema. Google needs
 * both: the schema to render the trail in the SERP, the markup so the crawler
 * has real internal links back up the hierarchy.
 */
const Breadcrumbs = ({ items }) => {
	const allItems = [{ name: "Home", url: "/" }, ...items];

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(generateBreadcrumbSchema(items)),
				}}
			/>
			<nav aria-label="Breadcrumb" className="mb-8">
				<ol className="flex flex-wrap items-center gap-2 text-sm font-mono text-white/40">
					{allItems.map((item, i) => (
						<li key={`${item.url}-${i}`} className="flex items-center gap-2">
							{i > 0 && <span aria-hidden="true" className="text-white/20">/</span>}
							{i < allItems.length - 1 ? (
								<Link
									href={item.url}
									className="hover:text-[#00ff41] transition-colors duration-300"
								>
									{item.name}
								</Link>
							) : (
								<span className="text-white/70">{item.name}</span>
							)}
						</li>
					))}
				</ol>
			</nav>
		</>
	);
};

export default Breadcrumbs;
