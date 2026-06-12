import Link from 'next/link';
import { SITE } from '@/lib/site-config';

export default function LandingFooter() {
  return (
    <footer className="bg-gray-900 px-4 py-10 text-gray-300 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">{SITE.name}</p>
          <p className="mt-2 max-w-sm text-sm">{SITE.description}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link href="/setup" className="hover:text-white">
            Ücretsiz dene
          </Link>
          <Link href="/login" className="hover:text-white">
            Çadıra giriş
          </Link>
          <Link href="/login/admin" className="hover:text-white">
            Organizatör girişi
          </Link>
          <Link href="/#sss" className="hover:text-white">
            SSS
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-gray-500">
        Ana ekrana ekleyerek uygulama gibi kullanabilirsiniz · Fotoğraf: Unsplash
      </p>
    </footer>
  );
}
