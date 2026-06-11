'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIos(ios);

    if (localStorage.getItem('pwa-install-dismissed') === '1') {
      setDismissed(true);
    }

    function onBip(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }

    window.addEventListener('beforeinstallprompt', onBip);
    return () => window.removeEventListener('beforeinstallprompt', onBip);
  }, []);

  if (isStandalone || dismissed) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', '1');
  }

  function dismiss() {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', '1');
  }

  if (isIos) {
    return (
      <div className="mb-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
        <p className="font-semibold">Ana ekrana ekleyin</p>
        <p className="mt-1">
          Safari&apos;de paylaş simgesine dokunun → &quot;Ana Ekrana Ekle&quot;
        </p>
        <button onClick={dismiss} className="mt-2 text-emerald-700 underline">
          Tamam
        </button>
      </div>
    );
  }

  if (!deferred) return null;

  return (
    <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3">
      <p className="text-sm font-medium text-emerald-900">Uygulamayı ana ekrana ekleyin</p>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={install}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
        >
          Ekle
        </button>
        <button onClick={dismiss} className="rounded-lg bg-gray-200 px-3 py-2 text-sm">
          ×
        </button>
      </div>
    </div>
  );
}
