export default function sitemap() {
  const baseUrl = "https://ashiwanikumar.com";

  // Use a stable date rather than new Date() which changes every build
  // Update this when actual content changes
  const lastUpdated = "2026-09-03T00:00:00.000Z";

  return [
    {
      url: baseUrl,
      lastModified: lastUpdated,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: lastUpdated,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: lastUpdated,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: lastUpdated,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified: lastUpdated,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cv/Ashiwani_Kumar_CV.pdf`,
      lastModified: lastUpdated,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: lastUpdated,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-notice`,
      lastModified: "2025-01-01T00:00:00.000Z",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: "2025-01-01T00:00:00.000Z",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies-policy`,
      lastModified: "2025-01-01T00:00:00.000Z",
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
