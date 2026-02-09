export default function sitemap() {
  const baseUrl = 'https://ashiwanikumar.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
