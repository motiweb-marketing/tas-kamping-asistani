'use client';

import { useState } from 'react';

interface Props {
  onReset: () => Promise<boolean>;
  disabled?: boolean;
  className?: string;
}

export default function ResetSetupButton({ onReset, disabled, className = '' }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    setResetting(true);
    const ok = await onReset();
    setResetting(false);
    if (ok) setConfirming(false);
  }

  if (!confirming) {
    return (
      <button
        type="button"
        disabled={disabled || resetting}
        onClick={() => setConfirming(true)}
        className={`min-h-[44px] rounded-lg border-2 border-amber-300 bg-amber-50 px-4 text-sm font-semibold text-amber-900 disabled:opacity-50 ${className}`}
      >
        Kurulumu sıfırla
      </button>
    );
  }

  return (
    <div className={`rounded-xl border-2 border-amber-300 bg-amber-50 p-4 ${className}`}>
      <p className="text-sm text-amber-900">
        Kamp tipi, asistan cevapları ve su planı silinecek. Menü günleri ve yayınlanan menü
        kalır.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={resetting}
          className="min-h-[44px] flex-1 rounded-lg border-2 border-gray-300 font-semibold"
        >
          Vazgeç
        </button>
        <button
          type="button"
          onClick={() => void handleReset()}
          disabled={resetting}
          className="min-h-[44px] flex-1 rounded-lg bg-amber-600 font-semibold text-white disabled:opacity-50"
        >
          {resetting ? 'Sıfırlanıyor...' : 'Evet, sıfırla'}
        </button>
      </div>
    </div>
  );
}
