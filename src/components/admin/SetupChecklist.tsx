'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SetupChecklistProps {
  tentCount: number;
  userCount: number;
  hasDates: boolean;
  hasApiKey: boolean;
  menuCount: number;
  itemCount: number;
}

const SHARED_KEY = 'kamp-asistani-shared-creds';

export default function SetupChecklist({
  tentCount,
  userCount,
  hasDates,
  hasApiKey,
  menuCount,
  itemCount,
}: SetupChecklistProps) {
  const [sharedCreds, setSharedCreds] = useState(false);

  useEffect(() => {
    try {
      setSharedCreds(!!localStorage.getItem(SHARED_KEY));
    } catch {
      /* ignore */
    }
  }, []);

  const steps = [
    {
      done: tentCount >= 1 && userCount >= 1,
      label: 'Çadır ve en az bir kişi ekleyin',
      href: '/admin/tents',
    },
    {
      done: hasDates,
      label: 'Kamp tarihlerini ayarlayın',
      href: '/admin/kamp',
    },
    {
      done: menuCount > 0 && itemCount > 0,
      label: 'Menü yazın ve ortak listeyi yayınlayın',
      href: '/admin/listeler',
    },
    {
      done: sharedCreds,
      label: 'Katılımcılara giriş bilgisini paylaşın',
      href: '/admin/tents',
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-emerald-900">Kurulum kontrol listesi</h3>
        <span className="text-sm text-emerald-700">
          {doneCount}/{steps.length}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {steps.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className="flex items-start gap-2 rounded-lg bg-white/80 px-3 py-2 text-base hover:bg-white"
            >
              <span className="mt-0.5">{s.done ? '✅' : '⬜'}</span>
              <span className={s.done ? 'text-gray-600 line-through' : 'text-gray-900'}>
                {s.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function markCredentialsShared() {
  try {
    localStorage.setItem(SHARED_KEY, '1');
  } catch {
    /* ignore */
  }
}
