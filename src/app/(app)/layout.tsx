import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import InstallPrompt from '@/components/layout/InstallPrompt';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

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
    <div className="mx-auto min-h-screen max-w-lg pb-24 md:max-w-3xl lg:max-w-5xl">
      <AppHeader
        userName={session.user?.name || ''}
        isAdmin={session.user?.role === 'admin'}
      />
      <main className="p-4">
        <InstallPrompt />
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
