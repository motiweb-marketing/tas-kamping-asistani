import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export default async function HomePage() {
  const session = await getSession();
  if (session.isLoggedIn) {
    redirect('/items');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-emerald-800">Taş Kamping Asistanı</h1>
        <p className="mt-2 text-lg text-gray-600">
          Kamp organizasyonu, malzeme listesi ve bütçe
        </p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Link
          href="/login"
          className="flex min-h-[52px] items-center justify-center rounded-xl bg-emerald-600 text-lg font-semibold text-white active:bg-emerald-700"
        >
          Giriş Yap
        </Link>
        <Link
          href="/setup"
          className="flex min-h-[52px] items-center justify-center rounded-xl border-2 border-emerald-600 text-lg font-semibold text-emerald-700 active:bg-emerald-50"
        >
          Yeni Kamp Oluştur
        </Link>
      </div>
    </main>
  );
}
