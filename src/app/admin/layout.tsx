import AdminSidebar from '@/components/admin/AdminSidebar';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.isLoggedIn) redirect('/login');
  if (session.user?.role !== 'admin') redirect('/items');

  return (
    <div className="flex min-h-screen flex-col bg-sand-50 lg:flex-row">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-4 sm:px-4 lg:max-w-4xl lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
