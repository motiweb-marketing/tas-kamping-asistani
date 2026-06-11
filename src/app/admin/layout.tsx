import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.isLoggedIn) redirect('/login');
  if (session.user?.role !== 'admin') redirect('/items');

  const links = [
    { href: '/admin', label: 'Panel' },
    { href: '/admin/tents', label: 'Çadırlar & Kişiler' },
    { href: '/admin/camp-settings', label: 'Kamp Ayarları' },
    { href: '/admin/duties', label: 'Kamp Planı' },
    { href: '/admin/items-review', label: 'Liste Review' },
    { href: '/admin/settings', label: 'Ayarlar' },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-lg md:max-w-3xl lg:max-w-5xl">
      <header className="sticky top-0 z-40 border-b bg-white px-4 py-3">
        <h1 className="text-lg font-bold text-emerald-800">Admin Paneli</h1>
        <nav className="mt-2 flex flex-wrap gap-2 lg:flex-nowrap">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/items" className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700">
            Uygulamaya Dön
          </Link>
        </nav>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}
