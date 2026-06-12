import Link from 'next/link';
import ContactCtaButtons from './ContactCtaButtons';

const TRIAL_INCLUDES = [
  '1 çadır, en fazla 2 kişi (organizatör + 1 katılımcı)',
  'Tüm özellikler: liste, AI, harcama, nöbet, chat',
  'İkinci kişi de giriş yapıp uygulamayı deneyebilir',
  'Kredi kartı gerekmez',
];

const PAID_INCLUDES = [
  'Sınırsız çadır ve katılımcı',
  'Çok günlü büyük kamplar için tam destek',
  'Öncelikli destek ve kurulum yardımı',
];

export default function PricingTrialSection() {
  return (
    <section className="bg-gray-50 py-12 lg:py-16" id="fiyatlandirma">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
          Önce deneyin, sonra karar verin
        </h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border-2 border-emerald-400 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase text-emerald-600">Ücretsiz deneme</p>
            <p className="mt-2 text-3xl font-bold">0 ₺</p>
            <ul className="mt-4 space-y-2 text-gray-700">
              {TRIAL_INCLUDES.map((t) => (
                <li key={t}>✓ {t}</li>
              ))}
            </ul>
            <Link
              href="/setup"
              className="mt-6 flex min-h-[48px] items-center justify-center rounded-xl bg-emerald-600 font-semibold text-white"
            >
              Hemen başla
            </Link>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase text-gray-500">Tam sürüm</p>
            <p className="mt-2 text-3xl font-bold">İletişime geçin</p>
            <ul className="mt-4 space-y-2 text-gray-700">
              {PAID_INCLUDES.map((t) => (
                <li key={t}>✓ {t}</li>
              ))}
            </ul>
            <ContactCtaButtons
              message="Kamp Asistanı tam sürüm için fiyat ve bilgi almak istiyorum."
              className="mt-6"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
