'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthAlert from '@/components/auth/AuthAlert';
import AuthButton from '@/components/auth/AuthButton';
import AuthCard from '@/components/auth/AuthCard';
import AuthField from '@/components/auth/AuthField';
import AuthShell from '@/components/auth/AuthShell';

interface CampaignOption {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

interface CampaignBanner {
  name: string;
  start_date: string;
  end_date: string;
}

function TentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/home';
  const kampId = searchParams.get('kamp') || '';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [campaignBanner, setCampaignBanner] = useState<CampaignBanner | null>(null);
  const [pickCampaign, setPickCampaign] = useState<CampaignOption[] | null>(null);

  useEffect(() => {
    if (!kampId) {
      setCampaignBanner(null);
      return;
    }
    fetch(`/api/campaigns/public?id=${encodeURIComponent(kampId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.campaign) setCampaignBanner(d.campaign);
      })
      .catch(() => setCampaignBanner(null));
  }, [kampId]);

  async function submitLogin(campaignId?: string) {
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        ...(campaignId || kampId ? { campaign_id: campaignId || kampId } : {}),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.status === 409 && data.pickCampaign?.length) {
      setPickCampaign(data.pickCampaign);
      setError('');
      return;
    }

    if (!res.ok) {
      setError(data.error || data.message || 'Giriş başarısız');
      return;
    }

    router.push(data.redirectTo || redirect);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPickCampaign(null);
    await submitLogin();
  }

  async function handlePickCampaign(id: string) {
    await submitLogin(id);
  }

  if (pickCampaign) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-forest-700">
          Aynı kullanıcı adı birden fazla kampta kayıtlı. Hangi kampa girmek istiyorsunuz?
        </p>
        <ul className="space-y-2">
          {pickCampaign.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                disabled={loading}
                onClick={() => void handlePickCampaign(c.id)}
                className="w-full rounded-xl border-2 border-forest-200 bg-white px-4 py-3 text-left transition-colors hover:border-forest-500 hover:bg-forest-50 disabled:opacity-50"
              >
                <span className="block font-bold text-forest-950">{c.name}</span>
                <span className="text-sm text-forest-600">
                  {c.start_date} — {c.end_date}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setPickCampaign(null)}
          className="text-sm font-semibold text-forest-500 underline"
        >
          ← Giriş formuna dön
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {campaignBanner && (
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-bold">{campaignBanner.name}</p>
          <p>
            {campaignBanner.start_date} — {campaignBanner.end_date}
          </p>
        </div>
      )}

      <AuthField
        label="Kullanıcı adı"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        placeholder="okacara (@ yazmayın)"
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
            Organizatör müsünüz? Aynı form ile giriş yapabilirsiniz.{' '}
            <Link href="/setup" className="font-semibold text-forest-800 underline hover:text-forest-950">
              Ücretsiz kamp oluştur
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
