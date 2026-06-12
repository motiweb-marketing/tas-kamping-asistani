import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ContactCtaSection from '@/components/landing/ContactCtaSection';
import FaqSection from '@/components/landing/FaqSection';
import FeatureGrid from '@/components/landing/FeatureGrid';
import LandingFooter from '@/components/landing/LandingFooter';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';
import LandingJsonLd from '@/components/landing/LandingJsonLd';
import PricingTrialSection from '@/components/landing/PricingTrialSection';
import ProblemSolutionSection from '@/components/landing/ProblemSolutionSection';
import ScreenshotShowcase from '@/components/landing/ScreenshotShowcase';
import TentLoginCard from '@/components/landing/TentLoginCard';
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
    <div className="min-h-screen bg-gray-50">
      <LandingJsonLd />
      <LandingHeader />
      <main>
        <LandingHero />
        <ProblemSolutionSection />
        <FeatureGrid />
        <ScreenshotShowcase />
        <PricingTrialSection />
        <TentLoginCard />
        <FaqSection />
        <ContactCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
