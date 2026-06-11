'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function TentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/items';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [campaignId, setCampaignId] = useState(searchParams.get('campaign') || '');
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
        campaign_id: campaignId,
        mode: 'tent',
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Giriş başarısız');
      return;
    }

    router.push(data.redirectTo || redirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-lg font-medium">Kamp Kodu</label>
        <input
          type="text"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          placeholder="Organizatörden aldığınız kod"
          className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
          required
        />
      </div>

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

      {error && (
        <p className="rounded-lg bg-red-100 p-3 text-lg text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 min-h-[52px] rounded-xl bg-emerald-600 text-lg font-semibold text-white disabled:opacity-50"
      >
        {loading ? 'Giriş yapılıyor...' : 'Çadıra Giriş Yap'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
        <Link href="/" className="mb-6 inline-block text-base text-emerald-700">
          ← Ana sayfaya dön
        </Link>

        <h1 className="mb-2 text-2xl font-bold">Çadıra Giriş Yap</h1>
        <p className="mb-6 text-base text-gray-600">
          Adminin size verdiği kamp kodu, kullanıcı adı ve şifre ile giriş yapın.
        </p>

        <Suspense fallback={<p className="text-gray-500">Yükleniyor...</p>}>
          <TentLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
