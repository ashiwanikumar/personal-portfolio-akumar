const SITE_NAME = "Ashiwani Kumar";
const SITE_URL = "https://ashiwanikumar.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/img/hero/ashiwani.png`;

export const SOCIAL_PROFILES = {
  linkedin: "https://www.linkedin.com/in/ashiwanikumar/",
  github: "https://github.com/ashiwanikumar",
  twitter: "https://x.com/theashvanikumar",
  facebook: "https://www.facebook.com/ashiwani0",
  instagram: "https://www.instagram.com/ashiwani0/",
};

export const siteConfig = {
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "Linux DevOps Engineer with 7+ years of experience managing mission-critical infrastructure across UAE. Expert in Kubernetes, OpenShift, AWS, Terraform, Ansible, CI/CD, and DevSecOps practices.",
  ogImage: DEFAULT_OG_IMAGE,
};

export function generatePageMetadata({
  title,
  description,
  keywords,
  path = "",
  ogImage,
  ogType = "website",
  noindex = false,
  publishedTime,
  modifiedTime,
}) {
  const isAbsolute = typeof title !== "string";
  // Fit before the layout template appends " | Ashiwani Kumar", so the rendered
  // tag stays inside the SERP cut-off rather than being truncated mid-phrase.
  const fittedTitle = isAbsolute
    ? { absolute: fitTitle(title.absolute, false) }
    : fitTitle(title, true);
  const titleText = isAbsolute ? fittedTitle.absolute : fittedTitle;
  const url = `${SITE_URL}${path}`;
  const resolvedOgImage = ogImage || DEFAULT_OG_IMAGE;

  return {
    title: fittedTitle,
    // Clamped so an over-long description is trimmed on a word boundary here
    // rather than truncated mid-word by Google.
    description: clampWords(description, DESCRIPTION_LIMIT),
    keywords: keywords?.join(", "),
    ...(noindex && { robots: { index: false, follow: false } }),
    ...(!noindex && {
      robots: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    }),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: titleText,
      description,
      url,
      siteName: `${SITE_NAME} - SRE & DevOps Engineer`,
      type: ogType,
      ...(ogType === "article" && {
        publishedTime,
        modifiedTime: modifiedTime || publishedTime,
        authors: [SITE_URL],
      }),
      images: [
        { url: resolvedOgImage, width: 1200, height: 600, alt: titleText },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@theashvanikumar",
      creator: "@theashvanikumar",
      title: titleText,
      description,
      images: [resolvedOgImage],
    },
  };
}

export function generatePersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_NAME,
    url: SITE_URL,
    image: DEFAULT_OG_IMAGE,
    jobTitle: "Linux DevOps Engineer",
    worksFor: {
      "@type": "Organization",
      name: "Astek Middle East",
    },
    description: siteConfig.description,
    email: "ashvanikumar109@gmail.com",
    telephone: "+971 566182303",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Abu Dhabi",
      addressCountry: "UAE",
    },
    sameAs: Object.values(SOCIAL_PROFILES),
    knowsAbout: [
      "Linux DevOps Engineering",
      "DevOps",
      "Kubernetes",
      "OpenShift",
      "AWS",
      "Terraform",
      "Ansible",
      "CI/CD",
      "Cloud Infrastructure",
      "Linux Administration",
      "Docker",
      "Azure DevOps",
    ],
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${SITE_NAME} - Portfolio`,
    url: SITE_URL,
    description: siteConfig.description,
    author: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
    },
    inLanguage: "en-US",
  };
}

export function generateProfilePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
      image: DEFAULT_OG_IMAGE,
      jobTitle: "Linux DevOps Engineer",
      worksFor: {
        "@type": "Organization",
        name: "Astek Middle East",
      },
      sameAs: Object.values(SOCIAL_PROFILES),
    },
    dateCreated: "2024-01-01",
    dateModified: new Date().toISOString().split("T")[0],
  };
}

export function generateBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", url: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function generateServicesSchema(services) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "DevOps & SRE Services by Ashiwani Kumar",
    description: "Professional DevOps and infrastructure engineering services",
    numberOfItems: services.length,
    itemListElement: services.map((service, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.desc,
        provider: {
          "@type": "Person",
          name: SITE_NAME,
          url: SITE_URL,
        },
        areaServed: {
          "@type": "Place",
          name: "UAE, India, Worldwide (Remote)",
        },
        serviceType: service.title,
      },
    })),
  };
}

export function generatePortfolioSchema(projects) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "DevOps & Infrastructure Portfolio",
    description: "Featured DevOps, cloud infrastructure, and SRE projects by Ashiwani Kumar",
    url: `${SITE_URL}/portfolio`,
    author: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((project, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: project.title,
          description: project.desc,
          author: { "@type": "Person", name: SITE_NAME },
          keywords: project.tags?.join(", "),
        },
      })),
    },
  };
}

export function generateResumeSchema(experience, education) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_NAME,
    url: `${SITE_URL}/resume`,
    jobTitle: "Linux DevOps Engineer",
    hasOccupation: experience?.map((exp) => ({
      "@type": "Occupation",
      name: exp.designation || exp.title,
      description: exp.desc,
      occupationLocation: {
        "@type": "Place",
        name: exp.location || "UAE",
      },
    })),
    hasCredential: education?.map((edu) => ({
      "@type": "EducationalOccupationalCredential",
      name: edu.title || edu.designation,
      description: edu.desc,
    })),
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * SERP fitting
 *
 * Google truncates titles around 60 characters and descriptions around 158.
 * A title cut mid-word reads as broken, so trim on a boundary instead.
 * ──────────────────────────────────────────────────────────────────────────── */

const TITLE_LIMIT = 60;
const TITLE_SUFFIX = ` | ${SITE_NAME}`;
export const DESCRIPTION_LIMIT = 158;

/** Truncate on a word boundary and strip trailing punctuation. */
export function clampWords(text, max) {
  if (!text || text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).replace(/[\s,;:.|–—-]+$/, "")}…`;
}

/**
 * Fits a title inside the SERP cut-off, but only when it can do so cleanly.
 *
 * Over-long titles here are `Primary phrase | Secondary phrase`, where the
 * secondary half is what Google was truncating anyway. Dropping whole trailing
 * segments keeps the primary keyword intact and still reads as a sentence.
 * With no separator to drop the title is returned unchanged — hard-truncating a
 * single phrase reads worse than Google's own truncation and throws away
 * keyword text the full tag still earns relevance for.
 */
export function fitTitle(title, hasBrandSuffix = true) {
  const budget = TITLE_LIMIT - (hasBrandSuffix ? TITLE_SUFFIX.length : 0);
  if (title.length <= budget) return title;

  // A spaced hyphen counts as a separator; an unspaced one does not, so
  // "Blue-Green Deployment" is never split.
  const segments = title.split(/\s+[|\u2013\u2014-]\s+/);
  for (let i = segments.length - 1; i > 0; i--) {
    const candidate = segments.slice(0, i).join(" - ");
    if (candidate.length <= budget) return candidate;
  }
  return title;
}

export const AUTHOR = {
  "@type": "Person",
  name: SITE_NAME,
  url: SITE_URL,
  jobTitle: "Linux DevOps Engineer",
  sameAs: Object.values(SOCIAL_PROFILES),
};

export function generateBlogPostingSchema(post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription,
    image: `${SITE_URL}${post.coverImage}`,
    datePublished: post.date,
    dateModified: post.lastUpdated || post.date,
    author: AUTHOR,
    publisher: AUTHOR,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.keywords?.join(", "),
    articleSection: post.category,
    inLanguage: "en-US",
    ...(post.quickAnswer && { abstract: post.quickAnswer }),
  };
}

/**
 * Guides are step-by-step, so they earn HowTo rather than Article. Google shows
 * the step list in the SERP when the steps carry names and text.
 */
export function generateHowToSchema(guide) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.title,
    description: guide.seoDescription,
    totalTime: guide.totalTime,
    author: AUTHOR,
    ...(guide.lastUpdated && { dateModified: guide.lastUpdated }),
    ...(guide.prerequisites?.length && {
      supply: guide.prerequisites.map((p) => ({ "@type": "HowToSupply", name: p })),
    }),
    ...(guide.tools?.length && {
      tool: guide.tools.map((t) => ({ "@type": "HowToTool", name: t.name })),
    }),
    step: guide.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.description,
      url: `${SITE_URL}/guides/${guide.slug}#step-${s.step}`,
    })),
  };
}

export function generateDefinedTermSchema(term) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${SITE_URL}/glossary/${term.term}`,
    name: term.name,
    description: term.shortDefinition,
    termCode: term.term,
    ...(term.alsoKnownAs?.length && { alternateName: term.alsoKnownAs }),
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "DevOps & SRE Glossary",
      url: `${SITE_URL}/glossary`,
    },
  };
}

export function generateDefinedTermSetSchema(terms) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "DevOps & SRE Glossary",
    description:
      "Plain-English definitions of Kubernetes, Terraform, CI/CD, and SRE terminology, written from production experience.",
    url: `${SITE_URL}/glossary`,
    hasDefinedTerm: terms.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${SITE_URL}/glossary/${t.term}`,
      name: t.name,
      description: t.shortDefinition,
    })),
  };
}

export function generateItemListSchema({ name, description, path, items }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${SITE_URL}${path}`,
    author: AUTHOR,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: `${SITE_URL}${item.url}`,
      })),
    },
  };
}
