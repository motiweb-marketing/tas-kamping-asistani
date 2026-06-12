'use client';

import AuthButton from '@/components/auth/AuthButton';

interface TourWelcomeProps {
  onStart: () => void;
  onSkip: () => void;
}

export default function TourWelcome({ onStart, onSkip }: TourWelcomeProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <p className="text-3xl" aria-hidden>
          ⛺
        </p>
        <h2 className="mt-3 font-display text-xl font-bold text-forest-950">
          Kamp Asistanı&apos;na hoş geldiniz
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-forest-700">
          Kısa bir tanıtımla programın nasıl çalıştığını adım adım göstereceğiz. Kayıt sırasında
          girdiğiniz bilgiler duruyor — her adımda ne işe yaradığını anlatacağız.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-forest-600">
          <li>✓ 6 kısa adım — yaklaşık 3 dakika</li>
          <li>✓ Bilgileri kontrol edip düzenleyebilirsiniz</li>
          <li>✓ İstediğiniz zaman sol menüden geri dönebilirsiniz</li>
        </ul>
        <div className="mt-6 flex flex-col gap-3">
          <AuthButton type="button" onClick={onStart} className="w-full">
            Tanıtıma başla
          </AuthButton>
          <button
            type="button"
            onClick={onSkip}
            className="w-full rounded-xl py-3 text-sm font-semibold text-forest-500 hover:text-forest-800"
          >
            Tanıtımı atla — panele git
          </button>
        </div>
      </div>
    </div>
  );
}
