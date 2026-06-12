'use client';

import { useEffect, useState } from 'react';
import AuthAlert from '@/components/auth/AuthAlert';
import AuthButton from '@/components/auth/AuthButton';
import AuthField from '@/components/auth/AuthField';

export default function Step3Ucret() {
  const [fees, setFees] = useState({
    adult_accommodation_fee: '0',
    child_accommodation_fee: '0',
    accommodation_use_age_pricing: false,
    accommodation_child_age_max: '15',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/campaign')
      .then((r) => r.json())
      .then((d) => {
        if (d.campaign) {
          const c = d.campaign;
          setFees({
            adult_accommodation_fee: String(c.adult_accommodation_fee ?? 0),
            child_accommodation_fee: String(c.child_accommodation_fee ?? 0),
            accommodation_use_age_pricing: !!c.accommodation_use_age_pricing,
            accommodation_child_age_max: String(c.accommodation_child_age_max ?? 15),
          });
        }
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/admin/campaign', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adult_accommodation_fee: Number(fees.adult_accommodation_fee),
        child_accommodation_fee: fees.accommodation_use_age_pricing
          ? Number(fees.child_accommodation_fee)
          : Number(fees.adult_accommodation_fee),
        accommodation_use_age_pricing: fees.accommodation_use_age_pricing,
        accommodation_child_age_max: Number(fees.accommodation_child_age_max),
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'Kaydedilemedi');
      return;
    }
    setMessage('Konaklama ücretleri kaydedildi.');
  }

  if (loading) return <p className="text-sm text-forest-500">Yükleniyor...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-forest-600">
        Tesisin kişi başı konaklama ücretini girin. Bakiye hesabında çadır bazlı paylaşım için kullanılır.
        Bilmiyorsanız 0 bırakabilirsiniz; sonra düzenleyebilirsiniz.
      </p>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-forest-900">Fiyatlandırma</legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <label className="flex min-h-[44px] flex-1 cursor-pointer items-center gap-2 rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm has-[:checked]:border-forest-600 has-[:checked]:bg-forest-50">
            <input
              type="radio"
              name="accommodation_pricing"
              checked={!fees.accommodation_use_age_pricing}
              onChange={() => setFees({ ...fees, accommodation_use_age_pricing: false })}
              className="text-forest-700"
            />
            Herkes aynı ücret
          </label>
          <label className="flex min-h-[44px] flex-1 cursor-pointer items-center gap-2 rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm has-[:checked]:border-forest-600 has-[:checked]:bg-forest-50">
            <input
              type="radio"
              name="accommodation_pricing"
              checked={fees.accommodation_use_age_pricing}
              onChange={() => setFees({ ...fees, accommodation_use_age_pricing: true })}
              className="text-forest-700"
            />
            Yaşa göre yetişkin / çocuk
          </label>
        </div>
      </fieldset>
      <AuthField
        label={fees.accommodation_use_age_pricing ? 'Yetişkin kişi başı (₺)' : 'Kişi başı ücret (₺)'}
        type="number"
        min={0}
        step="0.01"
        value={fees.adult_accommodation_fee}
        onChange={(e) => setFees({ ...fees, adult_accommodation_fee: e.target.value })}
      />
      {fees.accommodation_use_age_pricing && (
        <>
          <AuthField
            label="Çocuk kişi başı (₺)"
            type="number"
            min={0}
            step="0.01"
            value={fees.child_accommodation_fee}
            onChange={(e) => setFees({ ...fees, child_accommodation_fee: e.target.value })}
          />
          <AuthField
            label="Çocuk yaş sınırı"
            type="number"
            min={0}
            max={99}
            value={fees.accommodation_child_age_max}
            onChange={(e) => setFees({ ...fees, accommodation_child_age_max: e.target.value })}
            hint="Bu yaşın altı çocuk ücreti uygulanır"
          />
        </>
      )}
      {error && <AuthAlert>{error}</AuthAlert>}
      {message && <AuthAlert variant="success">{message}</AuthAlert>}
      <AuthButton type="submit" loading={saving}>
        Kaydet
      </AuthButton>
    </form>
  );
}
