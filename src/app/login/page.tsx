'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthAlert from '@/components/auth/AuthAlert';
import AuthButton from '@/components/auth/AuthButton';
import AuthCard from '@/components/auth/AuthCard';
import AuthField from '@/components/auth/AuthField';
import AuthShell from '@/components/auth/AuthShell';

function TentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/items';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, mode: 'tent' }),
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthField
        label="Kullanıcı adı"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        required
      />
      <AuthField
        label="Şifre"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />

      {error && <AuthAlert>{error}</AuthAlert>}

      <AuthButton type="submit" loading={loading}>
        {loading ? 'Giriş yapılıyor...' : 'Çadıra giriş yap'}
      </AuthButton>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell backHref="/" backLabel="Ana sayfaya dön">
      <AuthCard
        title="Çadıra giriş yap"
        subtitle="Organizatörün size verdiği kullanıcı adı ve şifre ile giriş yapın."
        footer={
          <p className="text-center text-sm text-forest-600">
            Organizatör müsünüz?{' '}
            <Link href="/login/admin" className="font-semibold text-forest-800 underline hover:text-forest-950">
              Admin girişi
            </Link>
          </p>
        }
      >
        <Suspense fallback={<p className="text-sm text-forest-500">Yükleniyor...</p>}>
          <TentLoginForm />
        </Suspense>
      </AuthCard>
    </AuthShell>
  );
}
