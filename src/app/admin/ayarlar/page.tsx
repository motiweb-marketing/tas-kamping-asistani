'use client';

import { useEffect, useState } from 'react';
import type { CampaignSettings } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<CampaignSettings | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadSettings() {
    const res = await fetch('/api/admin/settings');
    const data = await res.json();
    if (res.ok) {
      setSettings(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const res = await fetch('/api/admin/settings', {
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
    setMessage('API anahtarı güvenli şekilde kaydedildi.');
  }

  if (loading) {
    return <p className="text-lg text-gray-500">Yükleniyor...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold">Ayarlar</h2>
        <p className="mt-1 text-lg text-gray-600">
          OpenRouter API anahtarınızı buradan yönetin.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-2xl text-white">
            🔐
          </span>
          <div>
            <h3 className="text-lg font-semibold">OpenRouter API Anahtarı</h3>
            <p className="text-sm text-gray-600">
              AI malzeme listesi oluşturmak için gerekli
            </p>
          </div>
        </div>

        <div
          className={`mb-5 rounded-xl px-4 py-3 text-base ${
            settings?.configured
              ? 'bg-green-100 text-green-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {settings?.configured ? (
            <>
              <span className="font-semibold">✓ Anahtar tanımlı</span>
              <p className="mt-1 font-mono text-sm">{settings.masked_key}</p>
            </>
          ) : (
            <span className="font-semibold">⚠ Henüz API anahtarı girilmedi</span>
          )}
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-lg font-medium">
              {settings?.configured ? 'Anahtarı Güncelle' : 'API Anahtarı'}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 pr-14 font-mono text-lg focus:border-emerald-500 focus:outline-none"
                autoComplete="off"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                aria-label={showKey ? 'Anahtarı gizle' : 'Anahtarı göster'}
              >
                {showKey ? '🙈' : '👁'}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Anahtar veritabanında saklanır; ortam değişkeni kullanılmaz. Sadece admin erişebilir.
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-100 p-3 text-lg text-red-700">{error}</p>
          )}
          {message && (
            <p className="rounded-lg bg-green-100 p-3 text-lg text-green-700">{message}</p>
          )}

          <button
            type="submit"
            disabled={saving || !apiKey.trim()}
            className="min-h-[52px] rounded-xl bg-emerald-600 text-lg font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Anahtarı Kaydet'}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-semibold text-gray-800">Anahtarı nereden alırım?</p>
        <p className="mt-1">
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 underline"
          >
            openrouter.ai/keys
          </a>{' '}
          adresinden ücretsiz veya ücretli anahtar oluşturabilirsiniz.
        </p>
      </div>
    </div>
  );
}
