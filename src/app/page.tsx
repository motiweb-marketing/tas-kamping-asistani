import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';
import FeatureGrid from '@/components/landing/FeatureGrid';
import TentLoginCard from '@/components/landing/TentLoginCard';
import LandingFooter from '@/components/landing/LandingFooter';

export default async function HomePage() {
  const session = await getSession();
  if (session.isLoggedIn) {
    redirect(session.user?.role === 'admin' ? '/admin' : '/items');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingHeader />
      <main>
        <LandingHero />
        <FeatureGrid />
        <TentLoginCard />
      </main>
      <LandingFooter />
    </div>
  );
}
