import Link from 'next/link';
import BottomNav from '@/components/layout/BottomNav';
import InstallPrompt from '@/components/layout/InstallPrompt';
import AdminBadge from '@/components/ui/AdminBadge';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

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
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-bold text-emerald-800">Taş Kamping</h1>
          <div className="flex items-center gap-3">
            {session.user?.role === 'admin' && (
              <Link
                href="/admin"
                className="hidden text-sm font-medium text-emerald-700 sm:inline hover:underline"
              >
                Admin Panel
              </Link>
            )}
            <span className="flex items-center text-sm text-gray-600">
              {session.user?.name}
              {session.user?.role === 'admin' && <AdminBadge />}
            </span>
          </div>
        </div>
      </header>
      <main className="p-4">
        <InstallPrompt />
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
