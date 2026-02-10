export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: 'https://ashiwanikumar.com/sitemap.xml',
    host: 'https://ashiwanikumar.com',
  };
}
