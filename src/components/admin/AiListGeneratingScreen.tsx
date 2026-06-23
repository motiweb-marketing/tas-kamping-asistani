'use client';

import { useEffect, useState } from 'react';

const MESSAGES = [
  'Listeniz AI agentlar tarafından titizlikle hazırlanıyor…',
  'Menüye göre malzeme miktarları hesaplanıyor…',
  'Pişirme ekipmanı ve tüketim malzemeleri ekleniyor…',
  'Alışveriş kategorileri düzenleniyor…',
  'Son kontroller yapılıyor…',
];

interface Props {
  participantCount?: number;
  error?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

export default function AiListGeneratingScreen({
  participantCount,
  error,
  onRetry,
  onCancel,
}: Props) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (error) return;
    const timer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [error]);

  return (
    <div className="flex flex-col items-center py-6 text-center">
      {!error && (
        <>
          <div className="relative mb-6 h-20 w-20" aria-hidden>
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-200 opacity-40" />
            <div className="absolute inset-2 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <div className="absolute inset-0 flex items-center justify-center text-3xl">🤖</div>
          </div>

          <p className="text-base font-bold text-forest-950">AI alışveriş listesi</p>
          {participantCount != null && (
            <p className="mt-1 text-sm text-forest-600">
              {participantCount} kişi için hesaplanıyor
            </p>
          )}

          <p
            key={msgIndex}
            className="mt-5 max-w-xs animate-pulse text-sm leading-relaxed text-forest-700"
          >
            {MESSAGES[msgIndex]}
          </p>

          <p className="mt-6 text-xs text-gray-400">
            Bu işlem birkaç dakika sürebilir. Hazır olunca listelere yönlendirileceksiniz.
          </p>
        </>
      )}

      {error && (
        <>
          <p className="text-3xl" aria-hidden>
            ⚠️
          </p>
          <p className="mt-3 text-sm font-semibold text-red-800">Liste oluşturulamadı</p>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <div className="mt-5 flex w-full gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="min-h-[48px] flex-1 rounded-xl border-2 border-gray-300 font-semibold"
              >
                Kapat
              </button>
            )}
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="min-h-[48px] flex-1 rounded-xl bg-blue-600 font-semibold text-white"
              >
                Tekrar dene
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
