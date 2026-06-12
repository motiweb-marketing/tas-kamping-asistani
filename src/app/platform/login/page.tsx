'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AuthAlert from '@/components/auth/AuthAlert';
import AuthButton from '@/components/auth/AuthButton';
import AuthField from '@/components/auth/AuthField';

export default function PlatformLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/platform/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Giriş başarısız');
      return;
    }

    router.push(data.redirectTo || '/platform');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Kamp Asistanı</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-white">Platform yönetimi</h1>
        <p className="mt-2 text-sm text-slate-400">
          Satış, deneme takibi ve müşteri kampları — sadece platform sahibi.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <AuthField
            label="Kullanıcı adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            className="border-slate-600 bg-slate-800 text-white"
          />
          <AuthField
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="border-slate-600 bg-slate-800 text-white"
          />
          {error && <AuthAlert>{error}</AuthAlert>}
          <AuthButton type="submit" loading={loading} className="w-full bg-indigo-600 hover:bg-indigo-500">
            Giriş yap
          </AuthButton>
        </form>
      </div>
    </div>
  );
}
