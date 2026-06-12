'use client';

import { useEffect, useState } from 'react';
import AuthAlert from '@/components/auth/AuthAlert';
import AuthButton from '@/components/auth/AuthButton';
import AuthField from '@/components/auth/AuthField';
import DateRangeFields from '@/components/forms/DateRangeFields';
import { dateRangeError } from '@/lib/date-range';

interface Step1KampProps {
  onSaved?: () => void;
}

export default function Step1Kamp({ onSaved }: Step1KampProps) {
  const [form, setForm] = useState({ name: '', location: '', start_date: '', end_date: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/campaign')
      .then((r) => r.json())
      .then((d) => {
        if (d.campaign) {
          setForm({
            name: d.campaign.name || '',
            location: d.campaign.location || '',
            start_date: d.campaign.start_date || '',
            end_date: d.campaign.end_date || '',
          });
        }
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const rangeErr = dateRangeError(form.start_date, form.end_date);
    if (rangeErr) {
      setSaving(false);
      setError(rangeErr);
      return;
    }

    const res = await fetch('/api/admin/campaign', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || 'Kaydedilemedi');
      return;
    }
    setMessage('Kamp bilgileri kaydedildi.');
    onSaved?.();
  }

  if (loading) return <p className="text-sm text-forest-500">Yükleniyor...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthField
        label="Kamp adı"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <AuthField
        label="Konum"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        hint="Kamp alanının adı veya bölgesi"
        required
      />
      <DateRangeFields
        startDate={form.start_date}
        endDate={form.end_date}
        onChange={(dates) => setForm({ ...form, ...dates })}
        required
      />
      {error && <AuthAlert>{error}</AuthAlert>}
      {message && <AuthAlert variant="success">{message}</AuthAlert>}
      <AuthButton type="submit" loading={saving}>
        Kaydet
      </AuthButton>
    </form>
  );
}
