'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/items';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        campaign_id: campaignId || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Giriş başarısız');
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col p-6">
      <Link href="/" className="mb-8 text-lg text-emerald-700">
        ← Ana Sayfa
      </Link>

      <h1 className="mb-6 text-2xl font-bold">Giriş Yap</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-lg font-medium">Kullanıcı Adı</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-lg font-medium">Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-lg font-medium">
            Kamp ID <span className="text-gray-400">(isteğe bağlı)</span>
          </label>
          <input
            type="text"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            placeholder="Linkteki kamp kodu"
            className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-100 p-3 text-lg text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 min-h-[52px] rounded-xl bg-emerald-600 text-lg font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
    </main>
  );
}
