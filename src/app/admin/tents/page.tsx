'use client';

import { useEffect, useState } from 'react';
import TrialUpgradeCard from '@/components/admin/TrialUpgradeCard';
import { markCredentialsShared } from '@/components/admin/SetupChecklist';
import type { CampaignLimits } from '@/lib/campaign-limits';
import { SITE } from '@/lib/site-config';
import type { SafeUser, Tent } from '@/types';

function copyLoginInfo(username: string, passwordHint?: string) {
  const lines = [
    `${SITE.name} — Kamp girişi`,
    `Adres: ${SITE.url}/login`,
    `Kullanıcı adı: ${username}`,
  ];
  if (passwordHint) lines.push(`Şifre: ${passwordHint}`);
  else lines.push('Şifre: (organizatör tarafından verildi)');
  const text = lines.join('\n');
  navigator.clipboard.writeText(text).then(() => {
    markCredentialsShared();
    alert('Giriş bilgisi panoya kopyalandı.');
  });
}

export default function AdminTentsPage() {
  const [tents, setTents] = useState<Tent[]>([]);
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [limits, setLimits] = useState<CampaignLimits | null>(null);
  const [tentName, setTentName] = useState('');
  const [userForm, setUserForm] = useState({
    name: '', age: '30', username: '', password: '', tent_id: '',
  });
  const [editingTentId, setEditingTentId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editTentName, setEditTentName] = useState('');
  const [editUser, setEditUser] = useState({
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
      const data = await res.json();
      setError(data.error || 'Çadır eklenemedi');
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
      const data = await res.json();
      setError(data.error || 'Kişi eklenemedi');
      return;
    }
    setUserForm({ name: '', age: '30', username: '', password: '', tent_id: '' });
    load();
  }

  function startEditTent(tent: Tent) {
    setEditingTentId(tent.id);
    setEditTentName(tent.name);
    setEditingUserId(null);
  }

  async function saveTent(id: string) {
    setError('');
    const res = await fetch(`/api/tents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editTentName }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Kaydedilemedi');
      return;
    }
    setEditingTentId(null);
    load();
  }

  async function deleteTent(id: string) {
    if (!confirm('Bu çadırı silmek istediğinize emin misiniz?')) return;
    setError('');
    const res = await fetch(`/api/tents/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Silinemedi');
      return;
    }
    load();
  }

  function startEditUser(user: SafeUser) {
    setEditingUserId(user.id);
    setEditUser({
      name: user.name,
      age: String(user.age),
      username: user.username,
      password: '',
      tent_id: user.tent_id || '',
    });
    setEditingTentId(null);
  }

  async function saveUser(id: string) {
    setError('');
    const payload: Record<string, unknown> = {
      name: editUser.name,
      age: Number(editUser.age),
      username: editUser.username,
      tent_id: editUser.tent_id || null,
    };
    if (editUser.password) payload.password = editUser.password;

    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Kaydedilemedi');
      return;
    }
    setEditingUserId(null);
    load();
  }

  async function deleteUser(id: string) {
    if (!confirm('Bu kişiyi silmek istediğinize emin misiniz?')) return;
    setError('');
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Silinemedi');
      return;
    }
    load();
  }

  const canAddTent = limits?.can_add_tent !== false;
  const canAddUser = limits?.can_add_user !== false;

  return (
    <div className="flex flex-col gap-8">
      {limits && <TrialUpgradeCard limits={limits} />}

      {error && (
        <p className="rounded-lg bg-red-100 p-3 text-lg text-red-700">{error}</p>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold">Çadır Ekle</h2>
        <form onSubmit={addTent} className="flex gap-2">
          <input
            value={tentName}
            onChange={(e) => setTentName(e.target.value)}
            placeholder="Çadır adı (ör: küçük kaçar ailesi)"
            className="flex-1 rounded-xl border-2 px-4 py-3 text-lg disabled:bg-gray-100"
            required
            disabled={!canAddTent}
          />
          <button
            type="submit"
            disabled={!canAddTent}
            className="min-h-[48px] rounded-xl bg-emerald-600 px-4 font-semibold text-white disabled:opacity-50"
          >
            Ekle
          </button>
        </form>

        <ul className="mt-4 space-y-3">
          {tents.map((t) => (
            <li key={t.id} className="rounded-xl border-2 border-gray-200 p-3">
              {editingTentId === t.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={editTentName}
                    onChange={(e) => setEditTentName(e.target.value)}
                    className="rounded-lg border-2 px-3 py-2 text-lg"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveTent(t.id)}
                      className="min-h-[44px] flex-1 rounded-lg bg-emerald-600 font-semibold text-white"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => setEditingTentId(null)}
                      className="min-h-[44px] rounded-lg bg-gray-200 px-4"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg">⛺ {t.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditTent(t)}
                      className="min-h-[44px] rounded-lg bg-blue-100 px-3 text-base font-medium text-blue-800"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => deleteTent(t.id)}
                      className="min-h-[44px] rounded-lg bg-red-100 px-3 text-base font-medium text-red-700"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Kişi Ekle</h2>
        <form onSubmit={addUser} className="flex flex-col gap-3">
          {[
            { key: 'name', label: 'Ad Soyad', type: 'text' },
            { key: 'age', label: 'Yaş', type: 'number' },
            { key: 'username', label: 'Kullanıcı Adı', type: 'text' },
            { key: 'password', label: 'Şifre', type: 'password' },
          ].map(({ key, label, type }) => (
            <input
              key={key}
              type={type}
              placeholder={label}
              value={userForm[key as keyof typeof userForm]}
              onChange={(e) => setUserForm({ ...userForm, [key]: e.target.value })}
              className="rounded-xl border-2 px-4 py-3 text-lg disabled:bg-gray-100"
              required
              disabled={!canAddUser}
            />
          ))}
          <select
            value={userForm.tent_id}
            onChange={(e) => setUserForm({ ...userForm, tent_id: e.target.value })}
            className="rounded-xl border-2 px-4 py-3 text-lg disabled:bg-gray-100"
            disabled={!canAddUser}
          >
            <option value="">Çadır seçin</option>
            {tents.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!canAddUser}
            className="min-h-[48px] rounded-xl bg-emerald-600 text-lg font-semibold text-white disabled:opacity-50"
          >
            Kişi Ekle
          </button>
        </form>

        <ul className="mt-4 space-y-3">
          {users.map((u) => (
            <li key={u.id} className="rounded-xl border-2 border-gray-200 p-3">
              {editingUserId === u.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                    placeholder="Ad Soyad"
                    className="rounded-lg border-2 px-3 py-2 text-lg"
                  />
                  <input
                    type="number"
                    value={editUser.age}
                    onChange={(e) => setEditUser({ ...editUser, age: e.target.value })}
                    placeholder="Yaş"
                    className="rounded-lg border-2 px-3 py-2 text-lg"
                  />
                  <input
                    value={editUser.username}
                    onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                    placeholder="Kullanıcı adı"
                    className="rounded-lg border-2 px-3 py-2 text-lg"
                  />
                  <input
                    type="password"
                    value={editUser.password}
                    onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                    placeholder="Yeni şifre (boş bırakılabilir)"
                    className="rounded-lg border-2 px-3 py-2 text-lg"
                  />
                  <select
                    value={editUser.tent_id}
                    onChange={(e) => setEditUser({ ...editUser, tent_id: e.target.value })}
                    className="rounded-lg border-2 px-3 py-2 text-lg"
                  >
                    <option value="">Çadır yok</option>
                    {tents.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveUser(u.id)}
                      className="min-h-[44px] flex-1 rounded-lg bg-emerald-600 font-semibold text-white"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => setEditingUserId(null)}
                      className="min-h-[44px] rounded-lg bg-gray-200 px-4"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-lg">
                    <strong>{u.name}</strong> ({u.age} yaş) — @{u.username}
                    {u.role === 'admin' && (
                      <span className="ml-2 rounded-full bg-emerald-200 px-2 py-0.5 text-sm font-semibold text-emerald-900">
                        Admin
                      </span>
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyLoginInfo(u.username)}
                      className="min-h-[44px] rounded-lg bg-emerald-100 px-3 text-sm font-medium text-emerald-900"
                    >
                      Giriş bilgisini kopyala
                    </button>
                    <button
                      onClick={() => startEditUser(u)}
                      className="min-h-[44px] flex-1 rounded-lg bg-blue-100 font-medium text-blue-800"
                    >
                      Düzenle
                    </button>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="min-h-[44px] flex-1 rounded-lg bg-red-100 font-medium text-red-700"
                      >
                        Sil
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
