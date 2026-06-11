import Image from 'next/image';

const FEATURES = [
  {
    icon: '📋',
    title: 'Malzeme Listesi',
    desc: 'Çadır bazlı üstlenme, renk kodlu durum takibi ve AI destekli liste oluşturma.',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f5f90?w=600&q=80',
    alt: 'Kamp malzemeleri',
  },
  {
    icon: '📅',
    title: 'Nöbet Planı',
    desc: 'Yemek, mangal, çay ve bulaşık görevleri — varış ve ayrılış günlerine göre otomatik slotlar.',
    image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&q=80',
    alt: 'Kamp ateşi',
  },
  {
    icon: '💰',
    title: 'Bütçe Paylaşımı',
    desc: '15 yaş altı yarım pay, çadır bazlı harcama ve adil denge hesabı.',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
    alt: 'Doğa yürüyüşü',
  },
  {
    icon: '💬',
    title: 'Kamp Sohbeti',
    desc: 'Anlık mesajlaşma; görev ve liste değişikliklerinde otomatik bildirimler.',
    image: 'https://images.unsplash.com/photo-1517824804614-7ec4e344796f?w=600&q=80',
    alt: 'Kamp grubu',
  },
  {
    icon: '⛺',
    title: 'Çadır Yönetimi',
    desc: 'Her çadır bir ekip; malzeme ve nöbet sorumlulukları çadır üzerinden atanır.',
    image: 'https://images.unsplash.com/photo-1496080174650-637e3d22a213?w=600&q=80',
    alt: 'Çadırlar',
  },
  {
    icon: '🤖',
    title: 'AI Liste',
    desc: 'Menüye göre alışveriş listesi üretimi; admin onayından sonra yayınlanır.',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
    alt: 'Yol ve doğa',
  },
];

const STEPS = [
  { step: '1', title: 'Organizatör admin girişi yapar', desc: 'Kamp oluşturur, çadır ve kişi ekler.' },
  { step: '2', title: 'Menü ve listeyi hazırlar', desc: 'AI ile malzeme listesi, nöbet planı otomatik.' },
  { step: '3', title: 'Katılımcılar çadır girişi yapar', desc: 'Kamp kodu + şifre ile uygulamaya bağlanır.' },
];

export default function FeatureGrid() {
  return (
    <>
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Her şey tek yerde
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-gray-600">
            Taş Kamping geleneğine uygun, mobil öncelikli kamp organizasyon aracı.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map((f) => (
              <article
                key={f.title}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-video">
                  <Image
                    src={f.image}
                    alt={f.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <p className="text-2xl">{f.icon}</p>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900">{f.title}</h3>
                  <p className="mt-2 text-base text-gray-600">{f.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-emerald-50 py-12 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-emerald-900 sm:text-3xl">
            Nasıl çalışır?
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
                  {s.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-base text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
