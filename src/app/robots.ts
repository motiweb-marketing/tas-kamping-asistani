import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/login/admin', '/setup'],
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/items',
          '/budget',
          '/chat',
          '/duties',
          '/menu',
          '/summary',
          '/my-tent',
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
