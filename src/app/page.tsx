import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import LandingJsonLd from '@/components/landing/LandingJsonLd';
import LandingPage from '@/components/landing/LandingPage';
import { SITE } from '@/lib/site-config';
import { getSession } from '@/lib/session';

export const metadata: Metadata = {
  title: SITE.name,
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
  },
};

export default async function HomePage() {
  const session = await getSession();
  if (session.isLoggedIn) {
    redirect(session.user?.role === 'admin' ? '/admin' : '/items');
  }

  return (
    <>
      <LandingJsonLd />
      <LandingPage />
    </>
  );
}
