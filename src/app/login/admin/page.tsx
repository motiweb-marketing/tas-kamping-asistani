'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AuthAlert from '@/components/auth/AuthAlert';
import AuthButton from '@/components/auth/AuthButton';
import AuthCard from '@/components/auth/AuthCard';
import AuthField from '@/components/auth/AuthField';
import AuthShell from '@/components/auth/AuthShell';

export default function AdminLoginPage() {
  const router = useRouter();
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
      body: JSON.stringify({ username, password, mode: 'admin' }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Giriş başarısız');
      return;
    }

    router.push(data.redirectTo || '/admin');
    router.refresh();
  }

  return (
    <AuthShell backHref="/" backLabel="Ana sayfaya dön">
      <AuthCard
        title="Organizatör girişi"
        subtitle="Kamp paneline giriş yapın — liste, menü ve katılımcıları buradan yönetin."
        footer={
          <div className="space-y-3 text-center text-sm text-forest-600">
            <p>
              Henüz kampınız yok mu?{' '}
              <Link href="/setup" className="font-semibold text-forest-800 underline hover:text-forest-950">
                Ücretsiz kamp oluştur
              </Link>
            </p>
            <p>
              Katılımcı mısınız?{' '}
              <Link href="/login" className="font-semibold text-forest-800 underline hover:text-forest-950">
                Çadıra giriş
              </Link>
            </p>
          </div>
        }
      >
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
            {loading ? 'Giriş yapılıyor...' : 'Giriş yap'}
          </AuthButton>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
