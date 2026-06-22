'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import PlatformShell from '@/components/platform/PlatformShell';

interface PlatformSettingsState {
  configured: boolean;
  masked_key: string;
}

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettingsState | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const res = await fetch('/api/platform/settings');
    const data = await res.json();
    if (res.ok) setSettings(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const res = await fetch('/api/platform/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ openrouter_api_key: apiKey }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || 'Kaydedilemedi');
      return;
    }

    setSettings(data);
    setApiKey('');
    setShowKey(false);
    setMessage('OpenRouter anahtarı kaydedildi. Pro kamplar artık AI kullanabilir.');
  }

  return (
    <PlatformShell title="Platform ayarları">
      <Link href="/platform" className="mb-6 inline-block text-sm text-indigo-400 hover:text-indigo-300">
        ← Tüm kamplar
      </Link>

      {loading ? (
        <p className="text-slate-500">Yükleniyor...</p>
      ) : (
        <div className="max-w-xl space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="font-semibold text-white">OpenRouter API anahtarı</h2>
            <p className="mt-2 text-sm text-slate-400">
              Pro kampların AI menü ve alışveriş listesi özelliği bu anahtarı kullanır. Vercel
              ortam değişkeni yerine buradan yönetilir.
            </p>

            <div
              className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                settings?.configured
                  ? 'bg-emerald-950/50 text-emerald-300'
                  : 'bg-amber-950/40 text-amber-300'
              }`}
            >
              {settings?.configured ? (
                <>
                  <span className="font-semibold">Anahtar tanımlı</span>
                  <p className="mt-1 font-mono text-xs">{settings.masked_key}</p>
                </>
              ) : (
                <span className="font-semibold">Henüz anahtar girilmedi — Pro kamplar AI kullanamaz</span>
              )}
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-red-950/50 px-4 py-3 text-sm text-red-300">{error}</p>
            )}
            {message && (
              <p className="mt-4 rounded-lg bg-emerald-950/50 px-4 py-3 text-sm text-emerald-300">
                {message}
              </p>
            )}

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  {settings?.configured ? 'Anahtarı güncelle' : 'API anahtarı'}
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 pr-14 font-mono text-sm text-white"
                    autoComplete="off"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                  >
                    {showKey ? 'Gizle' : 'Göster'}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={saving || !apiKey.trim()}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </form>
          </div>

          <p className="text-xs text-slate-500">
            Anahtar almak için:{' '}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 underline"
            >
              openrouter.ai/keys
            </a>
          </p>
        </div>
      )}
    </PlatformShell>
  );
}
