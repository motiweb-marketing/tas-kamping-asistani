'use client';

import { useEffect, useState } from 'react';
import type { SafeUser, Tent } from '@/types';

export default function AdminTentsPage() {
  const [tents, setTents] = useState<Tent[]>([]);
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [tentName, setTentName] = useState('');
  const [userForm, setUserForm] = useState({
    name: '', age: '30', username: '', password: '', tent_id: '',
  });

  async function load() {
    const [tRes, uRes] = await Promise.all([
      fetch('/api/tents'),
      fetch('/api/users'),
    ]);
    const tData = await tRes.json();
    const uData = await uRes.json();
    setTents(tData.tents || []);
    setUsers(uData.users || []);
  }

  useEffect(() => { load(); }, []);

  async function addTent(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/tents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tentName }),
    });
    setTentName('');
    load();
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userForm, age: Number(userForm.age) }),
    });
    setUserForm({ name: '', age: '30', username: '', password: '', tent_id: '' });
    load();
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-4 text-xl font-bold">Çadır Ekle</h2>
        <form onSubmit={addTent} className="flex gap-2">
          <input
            value={tentName}
            onChange={(e) => setTentName(e.target.value)}
            placeholder="Çadır adı (ör: Küçük Kaçar Ailesi)"
            className="flex-1 rounded-xl border-2 px-4 py-3 text-lg"
            required
          />
          <button type="submit" className="min-h-[48px] rounded-xl bg-emerald-600 px-4 font-semibold text-white">
            Ekle
          </button>
        </form>
        <ul className="mt-4 space-y-2">
          {tents.map((t) => (
            <li key={t.id} className="rounded-lg bg-gray-100 px-4 py-2 text-lg">⛺ {t.name}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Kişi Ekle</h2>
        <form onSubmit={addUser} className="flex flex-col gap-3">
          {[
            { key: 'name', label: 'Ad', type: 'text' },
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
              className="rounded-xl border-2 px-4 py-3 text-lg"
              required={key !== 'tent_id'}
            />
          ))}
          <select
            value={userForm.tent_id}
            onChange={(e) => setUserForm({ ...userForm, tent_id: e.target.value })}
            className="rounded-xl border-2 px-4 py-3 text-lg"
          >
            <option value="">Çadır seçin</option>
            {tents.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button type="submit" className="min-h-[48px] rounded-xl bg-emerald-600 text-lg font-semibold text-white">
            Kişi Ekle
          </button>
        </form>

        <ul className="mt-4 space-y-2">
          {users.map((u) => (
            <li key={u.id} className="rounded-lg border px-4 py-2 text-base">
              <strong>{u.name}</strong> ({u.age} yaş) — @{u.username}
              {u.role === 'admin' && <span className="ml-2 text-emerald-700">[Admin]</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
