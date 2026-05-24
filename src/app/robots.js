export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/dashboard/", "/super-admin/", "/client-dashboard/", "/client-dashbaord/"],
      },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
    ],
    sitemap: "https://ashiwanikumar.com/sitemap.xml",
    host: "https://ashiwanikumar.com",
  };
}
