import { SITE } from '@/lib/site-config';

export default function LandingJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE.name,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    description: SITE.description,
    url: SITE.url,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TRY',
      description: 'Ücretsiz deneme: 1 çadır, 2 kişi',
    },
    inLanguage: 'tr',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
