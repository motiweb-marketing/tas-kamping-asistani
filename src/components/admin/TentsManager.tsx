'use client';

import { useEffect, useState } from 'react';
import TrialUpgradeCard from '@/components/admin/TrialUpgradeCard';
import { markCredentialsShared } from '@/components/admin/SetupChecklist';
import AuthAlert from '@/components/auth/AuthAlert';
import AuthButton from '@/components/auth/AuthButton';
import AuthField from '@/components/auth/AuthField';
import type { CampaignLimits } from '@/lib/campaign-limits';
import { SITE } from '@/lib/site-config';
import type { SafeUser, Tent } from '@/types';

export function copyLoginInfo(username: string) {
  const text = [
    `${SITE.name} — Kamp girişi`,
    `Adres: ${SITE.url}/login`,
    `Kullanıcı adı: ${username}`,
    'Şifre: (organizatör tarafından verildi)',
  ].join('\n');
  navigator.clipboard.writeText(text).then(() => {
    markCredentialsShared();
    alert('Giriş bilgisi panoya kopyalandı.');
  });
}

export default function TentsManager({ showShareButtons = true }: { showShareButtons?: boolean }) {
  const [tents, setTents] = useState<Tent[]>([]);
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [limits, setLimits] = useState<CampaignLimits | null>(null);
  const [tentName, setTentName] = useState('');
  const [userForm, setUserForm] = useState({
    name: '', age: '30', username: '', password: '', tent_id: '',
  });
  const [error, setError] = useState('');

  async function load() {
    const [tRes, uRes, cRes] = await Promise.all([
      fetch('/api/tents'),
      fetch('/api/users'),
      fetch('/api/campaign'),
    ]);
    const tData = await tRes.json();
    const uData = await uRes.json();
    const cData = await cRes.json();
    setTents(tData.tents || []);
    setUsers(uData.users || []);
    setLimits(cData.limits || null);
  }

  useEffect(() => { load(); }, []);

  async function addTent(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/tents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tentName }),
    });
    if (!res.ok) {
      setError((await res.json()).error || 'Çadır eklenemedi');
      return;
    }
    setTentName('');
    load();
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userForm, age: Number(userForm.age) }),
    });
    if (!res.ok) {
      setError((await res.json()).error || 'Kişi eklenemedi');
      return;
    }
    setUserForm({ name: '', age: '30', username: '', password: '', tent_id: '' });
    load();
  }

  async function deleteUser(id: string) {
    if (!confirm('Bu kişiyi silmek istediğinize emin misiniz?')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (!res.ok) setError((await res.json()).error || 'Silinemedi');
    else load();
  }

  const canAddTent = limits?.can_add_tent !== false;
  const canAddUser = limits?.can_add_user !== false;

  return (
    <div className="space-y-8">
      {limits && <TrialUpgradeCard limits={limits} />}
      {error && <AuthAlert>{error}</AuthAlert>}

      <section className="space-y-4">
        <h3 className="font-display text-lg font-bold text-forest-950">Çadır ekle</h3>
        <form onSubmit={addTent} className="flex flex-col gap-3 sm:flex-row">
          <AuthField
            label="Çadır adı"
            value={tentName}
            onChange={(e) => setTentName(e.target.value)}
            placeholder="ör: Büyük Kaçar Ailesi"
            disabled={!canAddTent}
            className="flex-1"
            required
          />
          <div className="flex items-end">
            <AuthButton type="submit" disabled={!canAddTent} className="w-full sm:w-auto sm:min-w-[120px]">
              Ekle
            </AuthButton>
          </div>
        </form>
        <ul className="space-y-2">
          {tents.map((t) => (
            <li key={t.id} className="rounded-xl border border-forest-100 bg-forest-50/50 px-4 py-3 text-sm font-medium text-forest-900">
              ⛺ {t.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="font-display text-lg font-bold text-forest-950">Kişi ekle</h3>
        <form onSubmit={addUser} className="grid gap-4 sm:grid-cols-2">
          <AuthField label="Ad soyad" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required disabled={!canAddUser} />
          <AuthField label="Yaş" type="number" value={userForm.age} onChange={(e) => setUserForm({ ...userForm, age: e.target.value })} required disabled={!canAddUser} />
          <AuthField label="Kullanıcı adı" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} required disabled={!canAddUser} />
          <AuthField label="Şifre" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required disabled={!canAddUser} />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-forest-900">Çadır</label>
            <select
              value={userForm.tent_id}
              onChange={(e) => setUserForm({ ...userForm, tent_id: e.target.value })}
              className="w-full rounded-xl border border-forest-200 bg-white px-4 py-3 text-base disabled:opacity-60"
              disabled={!canAddUser}
              required
            >
              <option value="">Seçin</option>
              {tents.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <AuthButton type="submit" disabled={!canAddUser}>Kişi ekle</AuthButton>
          </div>
        </form>

        <ul className="space-y-3">
          {users.map((u) => (
            <li key={u.id} className="rounded-xl border border-forest-100 bg-white p-4">
              <p className="text-sm font-semibold text-forest-900">
                {u.name} <span className="font-normal text-forest-500">@{u.username}</span>
                {u.role === 'admin' && (
                  <span className="ml-2 rounded-full bg-forest-100 px-2 py-0.5 text-xs">Admin</span>
                )}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {showShareButtons && (
                  <button
                    type="button"
                    onClick={() => copyLoginInfo(u.username)}
                    className="rounded-lg bg-forest-100 px-3 py-2 text-xs font-semibold text-forest-800"
                  >
                    Giriş bilgisini kopyala
                  </button>
                )}
                {u.role !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => deleteUser(u.id)}
                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                  >
                    Sil
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
