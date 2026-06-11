import Image from 'next/image';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80';

export default function LandingHero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Kamp organizasyonu artık kolay
        </p>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Taş Kamping için akıllı asistanınız
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600 lg:text-xl">
          Malzeme listesi, çadır görevleri, nöbet planı, bütçe paylaşımı ve kamp
          sohbeti — hepsi tek uygulamada. Organizatör admin panelinden yönetir,
          katılımcılar çadır girişiyle bağlanır.
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
