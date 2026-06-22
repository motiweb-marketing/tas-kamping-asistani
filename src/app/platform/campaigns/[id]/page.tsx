'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import PlatformShell from '@/components/platform/PlatformShell';
import PlatformUserEditModal from '@/components/platform/PlatformUserEditModal';
import type { SafeUser, Tent } from '@/types';

interface CampaignDetail {
  id: string;
  name: string;
  location: string;
  plan_tier: 'trial' | 'paid';
  max_tents: number;
  max_users: number;
  use_platform_ai: boolean;
  platform_notes: string | null;
  owner_contact_name: string | null;
  owner_contact_email: string | null;
  has_own_ai_key: boolean;
  admin_id: string | null;
  start_date: string;
  end_date: string;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return 'Hiç giriş yok';
  return new Date(iso).toLocaleString('tr-TR');
}

export default function PlatformCampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [tents, setTents] = useState<Tent[]>([]);
  const [notes, setNotes] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<SafeUser | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/platform/campaigns/${id}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Yüklenemedi');
      return;
    }
    setCampaign(data.campaign);
    setUsers(data.users || []);
    setTents(data.tents || []);
    setNotes(data.campaign.platform_notes || '');
    setContactName(data.campaign.owner_contact_name || '');
    setContactEmail(data.campaign.owner_contact_email || '');
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function patchCampaign(body: Record<string, unknown>) {
    setSaving(true);
    setError('');
    setMessage('');
    const res = await fetch(`/api/platform/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'Kaydedilemedi');
      return false;
    }
    setMessage('Güncellendi.');
    await load();
    return true;
  }

  async function saveMeta() {
    await patchCampaign({
      platform_notes: notes,
      owner_contact_name: contactName,
      owner_contact_email: contactEmail,
    });
  }

  async function setPlan(tier: 'trial' | 'paid') {
    if (!confirm(tier === 'paid' ? 'Bu kampı Pro yapmak istiyor musunuz? AI özelliği otomatik açılır.' : 'Deneme planına döndürmek istiyor musunuz?')) return;
    await patchCampaign({ plan_tier: tier });
  }

  async function deleteUser(userId: string, name: string) {
    if (!confirm(`${name} silinsin mi?`)) return;
    const res = await fetch(`/api/platform/users/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Silinemedi');
      return;
    }
    setMessage('Kişi silindi.');
    load();
  }

  async function deleteCampaign() {
    if (!campaign) return;
    if (!confirm(`"${campaign.name}" kampı ve TÜM verileri kalıcı silinecek. Emin misiniz?`)) return;
    const res = await fetch(`/api/platform/campaigns/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Silinemedi');
      return;
    }
    router.push('/platform');
  }

  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`/api/platform/campaigns/${id}/import`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setImporting(false);
    e.target.value = '';

    if (!res.ok) {
      setError(data.error || 'İçe aktarma başarısız');
      return;
    }

    setImportResult(
      `${data.created} kişi eklendi, ${data.skipped} atlandı.` +
        (data.errors?.length ? ` Uyarılar: ${data.errors.slice(0, 5).join('; ')}` : '')
    );
    load();
  }

  async function downloadTemplate() {
    const res = await fetch('/api/platform/import-template');
    if (!res.ok) {
      setError('Örnek dosya indirilemedi');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kamp-katilimcilar-ornek.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!campaign && !error) {
    return (
      <PlatformShell title="Kamp detayı">
        <p className="text-slate-500">Yükleniyor...</p>
      </PlatformShell>
    );
  }

  if (!campaign) {
    return (
      <PlatformShell title="Kamp detayı">
        <p className="text-red-400">{error}</p>
        <Link href="/platform" className="mt-4 inline-block text-indigo-400">
          ← Geri
        </Link>
      </PlatformShell>
    );
  }

  const tentName = (tentId: string | null) =>
    tents.find((t) => t.id === tentId)?.name || '—';

  return (
    <PlatformShell title={campaign.name}>
      <Link href="/platform" className="mb-6 inline-block text-sm text-indigo-400 hover:text-indigo-300">
        ← Tüm kamplar
      </Link>

      {error && <p className="mb-4 rounded-lg bg-red-950/50 px-4 py-3 text-red-300">{error}</p>}
      {message && <p className="mb-4 rounded-lg bg-emerald-950/50 px-4 py-3 text-emerald-300">{message}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="font-semibold text-white">Plan ve limitler</h2>
          <p className="mt-2 text-sm text-slate-400">
            {campaign.plan_tier === 'paid' ? 'Pro' : 'Deneme'} · {tents.length}/{campaign.max_tents} çadır ·{' '}
            {users.length}/{campaign.max_users} kişi
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {campaign.plan_tier === 'trial' ? (
              <button
                type="button"
                disabled={saving}
                onClick={() => setPlan('paid')}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
              >
                Pro&apos;ya yükselt (AI dahil)
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={() => setPlan('trial')}
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold"
              >
                Denemeye al
              </button>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Pro planda AI ile menü düzenleme ve alışveriş listesi oluşturma otomatik dahildir.
            {campaign.has_own_ai_key && ' (Eski müşteri API anahtarı kayıtlı — artık kullanılmıyor.)'}
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="font-semibold text-white">Müşteri notları</h2>
          <div className="mt-3 space-y-3">
            <input
              type="text"
              placeholder="İletişim kişisi"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            />
            <input
              type="email"
              placeholder="E-posta"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            />
            <textarea
              placeholder="Satış notları, fiyat, sözleşme..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
            />
            <button
              type="button"
              disabled={saving}
              onClick={saveMeta}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Notları kaydet
            </button>
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h2 className="font-semibold text-white">Toplu kişi yükleme (Excel)</h2>
        <p className="mt-1 text-sm text-slate-400">
          Örnek Excel dosyasını indirip doldurun; aynı dosyayı doğrudan yükleyebilirsiniz.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Sütunlar: Ad Soyad, Yaş, Kullanıcı Adı, Şifre, Çadır Adı
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={downloadTemplate}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300"
          >
            Örnek Excel indir
          </button>
          <label className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            {importing ? 'Yükleniyor...' : 'Dosya yükle'}
            <input
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              className="hidden"
              onChange={handleFileImport}
              disabled={importing}
            />
          </label>
        </div>
        {importResult && <p className="mt-3 text-sm text-emerald-400">{importResult}</p>}
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-semibold text-white">Kayıtlı kişiler ({users.length})</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-900 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Ad</th>
                <th className="px-4 py-3">Kullanıcı adı</th>
                <th className="px-4 py-3">Çadır</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Son giriş</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 text-white">
                    {u.name}
                  </td>
                  <td className="px-4 py-3 text-slate-300">@{u.username}</td>
                  <td className="px-4 py-3 text-slate-400">{tentName(u.tent_id)}</td>
                  <td className="px-4 py-3">
                    {u.role === 'admin' ? (
                      <span className="rounded bg-indigo-900/60 px-2 py-0.5 text-xs text-indigo-200">
                        Admin
                        {campaign.admin_id === u.id && ' · Ana'}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Katılımcı</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(u.last_login_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingUser(u)}
                        className="text-sm font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(u.id, u.name)}
                        className="text-sm font-semibold text-red-400 hover:text-red-300"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editingUser && (
        <PlatformUserEditModal
          user={editingUser}
          tents={tents}
          campaignAdminId={campaign.admin_id}
          open={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          onSaved={() => {
            setMessage(`${editingUser.name} güncellendi.`);
            load();
          }}
        />
      )}

      <section className="mt-10 border-t border-slate-800 pt-8">
        <button
          type="button"
          onClick={deleteCampaign}
          className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-2 text-sm font-semibold text-red-400"
        >
          Kampı tamamen sil
        </button>
      </section>
    </PlatformShell>
  );
}
