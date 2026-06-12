import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/setup`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/login/admin`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
