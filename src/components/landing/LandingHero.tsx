import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/lib/site-config';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80';

export default function LandingHero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-600">
          {SITE.tagline}
        </p>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Malzeme, nöbet, harcama ve sohbet — tek uygulamada
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600 lg:text-xl">
          WhatsApp gruplarında kaybolmayın. {SITE.name} ile listenizi hazırlayın,
          çadırlar malzeme üstlensin, harcamaları paylaşın, nöbetleri dağıtın.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/setup"
            className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-emerald-600 px-8 text-lg font-bold text-white shadow-lg"
          >
            Ücretsiz Dene
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border-2 border-emerald-600 px-8 text-lg font-semibold text-emerald-700"
          >
            Çadıra Giriş
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Deneme: 1 çadır, 2 kişi — kredi kartı gerekmez
        </p>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl lg:aspect-square">
        <Image
          src={HERO_IMAGE}
          alt="Göl kenarında çadır kampı"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
    </section>
  );
}
