'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'kamp-asistani-tour-v1-done';

const STEPS = [
  {
    title: 'Liste',
    body: 'Ortak listeden malzeme arayın ve adet seçerek üstlenin. Kişisel ve çadır listeleriniz ayrı sekmelerde.',
    icon: '📋',
  },
  {
    title: 'Harcama',
    body: 'Market fişlerini Harcama sekmesinden girin. Bakiye sekmesinde çadır bazlı paylaşımı görün.',
    icon: '💰',
  },
  {
    title: 'Nöbet',
    body: 'Nöbet Planı sayfasından yemek, mangal veya çay nöbetini üstlenin.',
    icon: '📅',
  },
  {
    title: 'Chat',
    body: 'Kamp sohbetinde duyuru yapın; liste güncellemeleri burada da görünür.',
    icon: '💬',
  },
];

export default function FirstVisitTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <p className="text-4xl" aria-hidden>
          {current.icon}
        </p>
        <p className="mt-2 text-sm font-medium text-emerald-600">
          Adım {step + 1} / {STEPS.length}
        </p>
        <h3 className="mt-1 text-xl font-bold text-gray-900">{current.title}</h3>
        <p className="mt-2 text-base text-gray-600">{current.body}</p>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={finish}
            className="min-h-[44px] rounded-xl px-4 text-gray-600"
          >
            Atla
          </button>
          <button
            type="button"
            onClick={() => (isLast ? finish() : setStep(step + 1))}
            className="min-h-[44px] flex-1 rounded-xl bg-emerald-600 font-semibold text-white"
          >
            {isLast ? 'Tamam' : 'İleri'}
          </button>
        </div>
      </div>
    </div>
  );
}
