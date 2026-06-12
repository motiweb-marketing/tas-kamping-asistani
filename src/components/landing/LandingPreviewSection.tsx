'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

const SLIDES = [
  {
    title: 'Kamp İhtiyaçları',
    desc: 'Kişisel, çadır ve kamp listeleri — çadırınız adet seçerek üstlenir.',
    preview: (
      <div className="space-y-2 p-3 text-sm">
        <div className="rounded-lg bg-amber-100 p-2 font-medium text-amber-900">Domates — 2 kg kaldı</div>
        <div className="rounded-lg bg-emerald-100 p-2 font-medium text-emerald-900">Tabak — tamamlandı</div>
      </div>
    ),
  },
  {
    title: 'Harcama & Bakiye',
    desc: 'Fiş tutarını girin; paylaşım otomatik hesaplanır.',
    preview: (
      <div className="space-y-2 p-3 text-sm text-forest-900">
        <p className="font-semibold">Konaklama: 2.200 ₺</p>
        <p className="rounded-lg bg-blue-50 p-2">Çadır A — alacaklı +120 ₺</p>
      </div>
    ),
  },
  {
    title: 'Nöbet Planı',
    desc: 'Hangi çadır hangi öğünü üstlenecek — tek tıkla alın.',
    preview: (
      <div className="space-y-2 p-3 text-sm">
        <p className="text-forest-800">Cumartesi akşam — Çadır B</p>
        <button type="button" className="w-full rounded-lg bg-forest-800 py-2 text-xs font-bold text-white">
          Nöbeti Al
        </button>
      </div>
    ),
  },
  {
    title: 'Kamp Sohbeti',
    desc: 'Duyurular ve sohbet aynı yerde.',
    preview: (
      <div className="space-y-2 p-3 text-sm">
        <p className="rounded bg-forest-100 px-2 py-1 text-center text-xs">Ahmet listeye peynir ekledi</p>
        <p className="ml-auto w-3/4 rounded bg-emerald-100 px-2 py-1">Yarın markete gidelim mi?</p>
      </div>
    ),
  },
];

export default function LandingPreviewSection() {
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];

  return (
    <section className="bg-sand-50 py-24" id="demo-sec">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-forest-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sand-100">
            <Sparkles className="h-3 w-3 text-amber-400" />
            Uygulama önizlemesi
          </span>
          <h2 className="font-display text-3xl font-bold text-forest-950 sm:text-4xl">
            Kamp Asistanı nasıl görünüyor?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-forest-600">
            Gerçek arayüzden örnekler — denemek için ücretsiz kamp oluşturun.
          </p>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="mx-auto w-full max-w-xs rounded-[2rem] border-4 border-forest-900 bg-white shadow-2xl">
            <div className="rounded-t-[1.75rem] bg-forest-50 px-4 py-2 text-center text-xs font-semibold text-forest-600">
              {slide.title}
            </div>
            <div className="min-h-[220px] text-forest-900">{slide.preview}</div>
          </div>

          <div>
            <h3 className="font-display text-xl font-bold text-forest-950">{slide.title}</h3>
            <p className="mt-2 text-base text-forest-700">{slide.desc}</p>
            <div className="mt-6 flex gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={`h-3 w-3 rounded-full transition-colors ${
                    i === idx ? 'bg-forest-800' : 'bg-forest-200'
                  }`}
                  aria-label={`Önizleme ${i + 1}`}
                />
              ))}
            </div>
            <Link
              href="/setup"
              className="mt-8 inline-flex min-h-[48px] items-center rounded-xl bg-forest-800 px-6 text-sm font-bold text-white shadow-md hover:bg-forest-900"
            >
              Ücretsiz dene — gerçek kamp oluştur
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
