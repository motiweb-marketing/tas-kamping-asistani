'use client';

import { useEffect, useState } from 'react';
import type { SafeUser, Tent } from '@/types';

interface Props {
  user: SafeUser;
  tents: Tent[];
  campaignAdminId?: string | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function PlatformUserEditModal({
  user,
  tents,
  campaignAdminId,
  open,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState({
    name: user.name,
    age: String(user.age),
    username: user.username,
    password: '',
    role: user.role as 'admin' | 'user',
    tent_id: user.tent_id || '',
    set_primary_admin: campaignAdminId === user.id,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm({
      name: user.name,
      age: String(user.age),
      username: user.username,
      password: '',
      role: user.role,
      tent_id: user.tent_id || '',
      set_primary_admin: campaignAdminId === user.id,
    });
    setShowPassword(false);
    setError('');
  }, [open, user, campaignAdminId]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const body: Record<string, unknown> = {
      name: form.name,
      age: Number(form.age),
      username: form.username,
      role: form.role,
      tent_id: form.tent_id || null,
      set_primary_admin: form.role === 'admin' && form.set_primary_admin,
    };
    if (form.password.trim()) {
      body.password = form.password;
    }

    const res = await fetch(`/api/platform/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || 'Kaydedilemedi');
      return;
    }

    onSaved();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="text-lg font-semibold text-white">Kişiyi düzenle</h3>
        <p className="mt-1 text-xs text-slate-400">
          Şifreler güvenlik nedeniyle görüntülenemez — yeni şifre belirleyebilirsiniz.
        </p>

        {error && (
          <p className="mt-3 rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="text-slate-400">Ad soyad</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-slate-400">Yaş</span>
              <input
                type="number"
                min={1}
                max={120}
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-400">Kullanıcı adı</span>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="text-slate-400">Yeni şifre</span>
            <div className="mt-1 flex gap-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Boş bırakırsanız değişmez"
                className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="shrink-0 rounded-lg border border-slate-600 px-3 text-xs text-slate-300"
              >
                {showPassword ? 'Gizle' : 'Göster'}
              </button>
            </div>
          </label>

          <label className="block text-sm">
            <span className="text-slate-400">Çadır</span>
            <select
              value={form.tent_id}
              onChange={(e) => setForm({ ...form, tent_id: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            >
              <option value="">— Atanmamış —</option>
              {tents.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className="text-sm text-slate-400">Rol</legend>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="radio"
                  name="role"
                  checked={form.role === 'user'}
                  onChange={() => setForm({ ...form, role: 'user', set_primary_admin: false })}
                />
                Katılımcı
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="radio"
                  name="role"
                  checked={form.role === 'admin'}
                  onChange={() => setForm({ ...form, role: 'admin' })}
                />
                Admin (organizatör)
              </label>
            </div>
          </fieldset>

          {form.role === 'admin' && (
            <label className="flex items-start gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.set_primary_admin}
                onChange={(e) => setForm({ ...form, set_primary_admin: e.target.checked })}
                className="mt-1"
              />
              Ana organizatör (kamp sahibi — platform listesinde görünür)
            </label>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-lg border border-slate-600 py-2.5 text-sm font-semibold text-slate-300"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
