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
}) {
  const titleText = typeof title === "string" ? title : title.absolute;
  const url = `${SITE_URL}${path}`;
  const resolvedOgImage = ogImage || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
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
      images: [
        { url: resolvedOgImage, width: 1200, height: 630, alt: titleText },
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
