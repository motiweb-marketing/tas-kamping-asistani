'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SetupPage() {
  const router = useRouter();
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

    router.push('/admin');
    router.refresh();
  }

  const fields = [
    { key: 'name', label: 'Kamp Adı', type: 'text' },
    { key: 'location', label: 'Konum', type: 'text' },
    { key: 'start_date', label: 'Varış Tarihi (ilk akşam yemeği)', type: 'date' },
    { key: 'end_date', label: 'Ayrılış Tarihi (son kahvaltı)', type: 'date' },
    { key: 'admin_name', label: 'Adınız Soyadınız', type: 'text' },
    { key: 'admin_tent_name', label: 'Çadırınızın Adı', type: 'text' },
    { key: 'admin_username', label: 'Kullanıcı Adınız', type: 'text' },
    { key: 'admin_password', label: 'Şifreniz', type: 'password' },
    { key: 'admin_age', label: 'Yaşınız', type: 'number' },
  ];

  return (
    <main className="flex min-h-screen flex-col p-6 pb-12">
      <Link href="/login/admin" className="mb-6 text-lg text-emerald-700">
        ← Admin girişi
      </Link>

      <h1 className="mb-2 text-2xl font-bold">Yeni Kamp Oluştur</h1>
      <p className="mb-4 text-base text-gray-600">
        Admin de kampın bir parçasıdır — adınızı ve çadırınızı girin.
      </p>

      <div className="mb-6 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
        <p className="font-semibold">Ücretsiz deneme</p>
        <p className="mt-1 text-sm">
          1 çadır, en fazla 2 kişi — tüm özellikleri deneyin. Limit sonrası tam sürüm için
          iletişime geçebilirsiniz.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {fields.map(({ key, label, type }) => (
          <div key={key}>
            <label className="mb-1 block text-lg font-medium">{label}</label>
            <input
              type={type}
              value={form[key as keyof typeof form]}
              onChange={(e) => update(key, e.target.value)}
              placeholder={key === 'admin_tent_name' ? 'ör: Büyük Kaçar Ailesi' : undefined}
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
        ))}

        {error && (
          <p className="rounded-lg bg-red-100 p-3 text-lg text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="min-h-[52px] rounded-xl bg-emerald-600 text-lg font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Oluşturuluyor...' : 'Kamp Oluştur'}
        </button>
      </form>
    </main>
  );
}
