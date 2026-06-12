'use client';

import { useState } from 'react';
import Link from 'next/link';

const SLIDES = [
  {
    title: 'Ortak Liste',
    desc: 'Malzemeleri arayın, adet seçerek üstlenin. Turuncu = eksik, yeşil = tamam.',
    preview: (
      <div className="space-y-2 p-3">
        <div className="rounded-lg bg-amber-100 p-2 text-sm font-medium">Domates — 2 kg kaldı</div>
        <div className="rounded-lg bg-emerald-100 p-2 text-sm font-medium">Tabak — tamamlandı</div>
        <div className="rounded-lg bg-blue-50 p-2 text-sm">+ Ekstra ekle</div>
      </div>
    ),
  },
  {
    title: 'Harcama & Bakiye',
    desc: 'Fiş tutarını girin; konaklama ve alışveriş payı otomatik hesaplanır.',
    preview: (
      <div className="space-y-2 p-3 text-sm">
        <p className="font-semibold">Konaklama: 2.200 ₺</p>
        <p>Alışveriş payı: 450 ₺ / pay</p>
        <p className="rounded bg-blue-100 p-2">Çadır A — alacaklı +120 ₺</p>
      </div>
    ),
  },
  {
    title: 'Nöbet Planı',
    desc: 'Hangi çadır hangi gün yemek yapacak — tek tıkla görev alın.',
    preview: (
      <div className="space-y-2 p-3 text-sm">
        <p>Cumartesi akşam — Çadır B</p>
        <p>Pazar kahvaltı — Çadır A</p>
        <button type="button" className="w-full rounded bg-emerald-600 py-2 text-white">
          Görevi Al
        </button>
      </div>
    ),
  },
  {
    title: 'Kamp Sohbeti',
    desc: 'Duyurular ve sohbet aynı yerde; liste güncellemeleri otomatik düşer.',
    preview: (
      <div className="space-y-2 p-3 text-sm">
        <p className="rounded bg-gray-200 px-2 py-1 text-center text-xs">Ahmet listeye peynir ekledi</p>
        <p className="ml-auto w-3/4 rounded bg-emerald-100 px-2 py-1">Yarın markete birlikte gidelim mi?</p>
      </div>
    ),
  },
];

export default function ScreenshotShowcase() {
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];

  return (
    <section className="bg-emerald-900 py-12 text-white lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Uygulamayı keşfedin</h2>
        <p className="mt-3 text-center text-emerald-100">
          Sanal tur — gerçek arayüzden örnekler
        </p>
        <div className="mt-10 grid items-center gap-8 lg:grid-cols-2">
          <div className="mx-auto w-full max-w-xs rounded-[2rem] border-4 border-gray-800 bg-white shadow-2xl">
            <div className="rounded-t-[1.75rem] bg-gray-100 px-4 py-2 text-center text-xs text-gray-500">
              {slide.title}
            </div>
            <div className="min-h-[220px] text-gray-900">{slide.preview}</div>
          </div>
          <div>
            <h3 className="text-xl font-bold">{slide.title}</h3>
            <p className="mt-2 text-lg text-emerald-100">{slide.desc}</p>
            <div className="mt-6 flex gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={`h-3 w-3 rounded-full ${i === idx ? 'bg-white' : 'bg-emerald-600'}`}
                  aria-label={`Slayt ${i + 1}`}
                />
              ))}
            </div>
            <Link
              href="/setup"
              className="mt-8 inline-flex min-h-[48px] items-center rounded-xl bg-white px-6 font-bold text-emerald-900"
            >
              Kendiniz deneyin — Ücretsiz
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
