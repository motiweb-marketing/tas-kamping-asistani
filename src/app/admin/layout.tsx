import AdminHeader from '@/components/layout/AdminHeader';
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
    <div className="mx-auto min-h-screen max-w-lg md:max-w-3xl lg:max-w-5xl">
      <AdminHeader />
      <main className="p-4">{children}</main>
    </div>
  );
}
