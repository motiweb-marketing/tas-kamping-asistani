import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import InstallPrompt from '@/components/layout/InstallPrompt';
import FirstVisitTour from '@/components/onboarding/FirstVisitTour';
import LeaderHomeWelcome from '@/components/onboarding/LeaderHomeWelcome';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect('/login');
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-sand-50 pb-28 md:max-w-3xl lg:max-w-5xl">
      <AppHeader
        userName={session.user?.name || ''}
        isAdmin={session.user?.role === 'admin'}
      />
      <main className="p-4 sm:p-5">
        <InstallPrompt />
        {session.user?.role === 'admin' && (
          <Suspense fallback={null}>
            <LeaderHomeWelcome />
          </Suspense>
        )}
        {session.user?.role !== 'admin' && <FirstVisitTour />}
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
