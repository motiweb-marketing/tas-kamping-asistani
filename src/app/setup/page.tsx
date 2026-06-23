'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import AuthAlert from '@/components/auth/AuthAlert';
import AuthButton from '@/components/auth/AuthButton';
import AuthCard from '@/components/auth/AuthCard';
import AuthField from '@/components/auth/AuthField';
import AuthShell from '@/components/auth/AuthShell';
import StepIndicator from '@/components/auth/StepIndicator';
import DateRangeFields from '@/components/forms/DateRangeFields';
import { dateRangeError } from '@/lib/date-range';

const STEPS = ['Kamp bilgileri', 'Organizatör hesabı'];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    location: 'Kamp alanı',
    start_date: '',
    end_date: '',
    admin_name: '',
    admin_tent_name: '',
    admin_username: '',
    admin_password: '',
    admin_age: '30',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  }

  function nextStep() {
    if (!form.name.trim()) {
      setError('Kamp adı zorunludur.');
      return;
    }
    const rangeErr = dateRangeError(form.start_date, form.end_date);
    if (rangeErr) {
      setError(rangeErr);
      return;
    }
    setError('');
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, admin_age: Number(form.admin_age) }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Kamp oluşturulamadı');
      return;
    }

    router.push('/home?leader=1');
    router.refresh();
  }

  return (
    <AuthShell backHref="/" backLabel="Ana sayfaya dön" variant="wide">
      <AuthCard
        title="Yeni kamp oluştur"
        subtitle="Organizatör de kampın bir parçasıdır — adınızı ve çadırınızı girin."
      >
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-forest-200 bg-gradient-to-r from-forest-50 to-sand-100 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-800 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-forest-900">Ücretsiz deneme</p>
            <p className="mt-0.5 text-xs leading-relaxed text-forest-600">
              1 çadır, en fazla 2 kişi — tüm özellikleri deneyin. Limit sonrası tam sürüm için iletişime
              geçebilirsiniz.
            </p>
          </div>
        </div>

        <StepIndicator steps={STEPS} current={step} />

        {step === 1 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              nextStep();
            }}
            className="space-y-5"
          >
            <AuthField
              label="Kamp adı"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="ör: Yaz Kampı 2026"
              required
            />
            <AuthField
              label="Konum"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              hint="Kamp alanının adı veya bölgesi"
              required
            />
            <DateRangeFields
              startDate={form.start_date}
              endDate={form.end_date}
              onChange={(dates) => {
                setForm((prev) => ({ ...prev, ...dates }));
                setError('');
              }}
              required
            />

            {error && <AuthAlert>{error}</AuthAlert>}

            <AuthButton type="submit">Devam et →</AuthButton>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <AuthField
                label="Adınız soyadınız"
                value={form.admin_name}
                onChange={(e) => update('admin_name', e.target.value)}
                required
              />
              <AuthField
                label="Yaşınız"
                type="number"
                min={1}
                max={120}
                value={form.admin_age}
                onChange={(e) => update('admin_age', e.target.value)}
                required
              />
            </div>
            <AuthField
              label="Çadırınızın adı"
              value={form.admin_tent_name}
              onChange={(e) => update('admin_tent_name', e.target.value)}
              placeholder="ör: Büyük Kaçar Ailesi"
              required
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <AuthField
                label="Kullanıcı adınız"
                value={form.admin_username}
                onChange={(e) => update('admin_username', e.target.value)}
                autoComplete="username"
                required
              />
              <AuthField
                label="Şifreniz"
                type="password"
                value={form.admin_password}
                onChange={(e) => update('admin_password', e.target.value)}
                autoComplete="new-password"
                hint="Katılımcılarla paylaşacağınız giriş şifresi"
                required
              />
            </div>

            {error && <AuthAlert>{error}</AuthAlert>}

            <div className="flex flex-col gap-3 sm:flex-row">
              <AuthButton type="button" variant="secondary" onClick={() => setStep(1)} className="sm:flex-1">
                ← Geri
              </AuthButton>
              <AuthButton type="submit" loading={loading} className="sm:flex-[2]">
                {loading ? 'Oluşturuluyor...' : 'Kampı oluştur'}
              </AuthButton>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-forest-500">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="font-semibold text-forest-700 underline hover:text-forest-900">
            Giriş yap
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
