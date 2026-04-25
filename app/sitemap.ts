import type { MetadataRoute } from 'next';

const BASE = 'https://dimecuando.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/app`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];
}
