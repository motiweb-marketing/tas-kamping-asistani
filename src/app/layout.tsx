import type { Metadata, Viewport } from 'next';
import { SITE } from '@/lib/site-config';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    'kamp organizasyonu',
    'kamp listesi',
    'malzeme listesi',
    'kamp bütçesi',
    'çadır kampı',
    'nöbet planı',
    'kamp asistanı',
    'alışveriş listesi',
  ],
  manifest: '/manifest.webmanifest',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.name,
    description: SITE.description,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE.name,
  },
  icons: {
    icon: '/icon',
    apple: '/icon',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
