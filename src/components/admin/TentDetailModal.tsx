'use client';

import { useEffect, useState } from 'react';
import { copyLoginInfo } from '@/components/admin/TentsManager';
import AuthAlert from '@/components/auth/AuthAlert';
import AuthButton from '@/components/auth/AuthButton';
import AuthField from '@/components/auth/AuthField';
import TentUpgradeModal from '@/components/admin/TentUpgradeModal';
import { tentCapacity, type CampaignLimits } from '@/lib/campaign-limits';
import type { SafeUser, Tent } from '@/types';

interface TentDetailModalProps {
  tent: Tent;
  users: SafeUser[];
  limits: CampaignLimits | null;
  showShareButtons: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onDeleteUser: (id: string) => Promise<void>;
}

const emptyUserForm = { name: '', age: '30', username: '', password: '' };

export default function TentDetailModal({
  tent,
  users,
  limits,
  showShareButtons,
  onClose,
  onRefresh,
  onDeleteUser,
}: TentDetailModalProps) {
  const tentUsers = users.filter((u) => u.tent_id === tent.id);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [editingUser, setEditingUser] = useState<SafeUser | null>(null);
  const [editForm, setEditForm] = useState({ ...emptyUserForm, password: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [capacityMsg, setCapacityMsg] = useState('');
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [savingCapacity, setSavingCapacity] = useState(false);

  const planMax = limits?.max_users_per_tent ?? 4;
  const maxPerTent = limits
    ? tentCapacity(tent, limits.plan_tier)
    : tent.max_capacity ?? planMax;
  const [capacityInput, setCapacityInput] = useState(String(maxPerTent));

  useEffect(() => {
    setCapacityInput(String(maxPerTent));
  }, [tent.id, maxPerTent]);

  const tentFull = tentUsers.length >= maxPerTent;
  const canAddCampaignUser = limits?.can_add_user !== false;
  const capacityDirty = Number(capacityInput) !== maxPerTent;

  function startEdit(user: SafeUser) {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      age: String(user.age),
      username: user.username,
      password: '',
    });
    setError('');
    setSuccessMsg('');
  }

  function cancelEdit() {
    setEditingUser(null);
    setEditForm({ ...emptyUserForm, password: '' });
  }

  async function saveCapacity() {
    setSavingCapacity(true);
    setError('');
    setCapacityMsg('');

    const res = await fetch(`/api/tents/${tent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ max_capacity: Number(capacityInput) }),
    });
    const data = await res.json();
    setSavingCapacity(false);

    if (!res.ok) {
      setError(data.error || 'Kapasite kaydedilemedi');
      return;
    }
    setCapacityMsg('Kapasite güncellendi.');
    onRefresh();
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!canAddCampaignUser) {
      setUpgradeOpen(true);
      return;
    }
    if (tentFull) {
      setError(`Bu çadırda en fazla ${maxPerTent} kişi olabilir.`);
      return;
    }

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userForm, age: Number(userForm.age), tent_id: tent.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 403 && limits?.plan_tier === 'trial') {
        setUpgradeOpen(true);
        return;
      }
      setError(data.error || 'Kişi eklenemedi');
      return;
    }
    setUserForm(emptyUserForm);
    setSuccessMsg('Kişi eklendi.');
    onRefresh();
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;

    setSavingEdit(true);
    setError('');
    setSuccessMsg('');

    const body: Record<string, string | number> = {
      name: editForm.name,
      age: Number(editForm.age),
      username: editForm.username,
    };
    if (editForm.password.trim()) {
      body.password = editForm.password;
    }

    const res = await fetch(`/api/users/${editingUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSavingEdit(false);

    if (!res.ok) {
      setError(data.error || 'Güncellenemedi');
      return;
    }

    setSuccessMsg(`${data.user.name} güncellendi.`);
    cancelEdit();
    onRefresh();
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-forest-950/40 p-0 sm:items-center sm:p-4"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:max-h-[85vh] sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tent-modal-title"
        >
          <div className="flex items-start justify-between border-b border-forest-100 px-5 py-4">
            <div>
              <h2 id="tent-modal-title" className="font-display text-lg font-bold text-forest-950">
                ⛺ {tent.name}
              </h2>
              <p className="mt-0.5 text-xs text-forest-500">
                {tentUsers.length}/{maxPerTent} kişi
                {limits?.plan_tier === 'trial' && canAddCampaignUser && !tentFull && (
                  <span className="text-blue-700"> — kişi ekleyebilirsiniz</span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-forest-500 hover:bg-forest-50"
              aria-label="Kapat"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {error && (
              <div className="mb-4">
                <AuthAlert>{error}</AuthAlert>
              </div>
            )}
            {successMsg && (
              <div className="mb-4">
                <AuthAlert variant="success">{successMsg}</AuthAlert>
              </div>
            )}
            {capacityMsg && (
              <div className="mb-4">
                <AuthAlert variant="success">{capacityMsg}</AuthAlert>
              </div>
            )}

            <div className="mb-5 rounded-xl border border-forest-100 bg-forest-50/60 p-4">
              <p className="text-sm font-semibold text-forest-900">Çadır kapasitesi</p>
              <p className="mt-0.5 text-xs text-forest-500">
                Bu çadırda en fazla kaç kişi olabileceğini belirleyin
                {limits?.plan_tier === 'trial' && ` (denemede en fazla ${planMax})`}.
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div className="w-28">
                  <AuthField
                    label="Kişi sayısı"
                    type="number"
                    min={Math.max(1, tentUsers.length)}
                    max={planMax}
                    value={capacityInput}
                    onChange={(e) => setCapacityInput(e.target.value)}
                  />
                </div>
                <AuthButton
                  type="button"
                  variant="secondary"
                  loading={savingCapacity}
                  disabled={!capacityDirty}
                  onClick={saveCapacity}
                  className="min-h-[48px] shrink-0"
                >
                  Kaydet
                </AuthButton>
              </div>
              {tentUsers.length > 0 && (
                <p className="mt-2 text-xs text-forest-500">
                  Şu an {tentUsers.length} kişi var — kapasite bundan az olamaz.
                </p>
              )}
            </div>

            <ul className="mb-6 space-y-2">
              {tentUsers.length === 0 && (
                <li className="rounded-xl border border-dashed border-forest-200 px-4 py-6 text-center text-sm text-forest-500">
                  Henüz kimse yok — aşağıdan ekleyin
                </li>
              )}
              {tentUsers.map((u) =>
                editingUser?.id === u.id ? (
                  <li
                    key={u.id}
                    className="rounded-xl border-2 border-forest-300 bg-white p-4"
                  >
                    <form onSubmit={saveEdit} className="space-y-3">
                      <p className="text-sm font-semibold text-forest-900">
                        Kişiyi düzenle
                        {u.role === 'admin' && (
                          <span className="ml-1 rounded-full bg-forest-200 px-2 py-0.5 text-[10px]">
                            Admin
                          </span>
                        )}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <AuthField
                          label="Ad soyad"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          required
                        />
                        <AuthField
                          label="Yaş"
                          type="number"
                          value={editForm.age}
                          onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                          required
                        />
                        <AuthField
                          label="Kullanıcı adı"
                          value={editForm.username}
                          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                          required
                        />
                        <AuthField
                          label="Yeni şifre"
                          type="password"
                          value={editForm.password}
                          onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                          placeholder="Boş bırakırsanız değişmez"
                        />
                      </div>
                      <div className="flex gap-2">
                        <AuthButton
                          type="button"
                          variant="secondary"
                          className="flex-1"
                          onClick={cancelEdit}
                        >
                          İptal
                        </AuthButton>
                        <AuthButton type="submit" loading={savingEdit} className="flex-1">
                          Kaydet
                        </AuthButton>
                      </div>
                    </form>
                  </li>
                ) : (
                  <li
                    key={u.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-forest-100 bg-forest-50/50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-forest-900">
                        {u.name}{' '}
                        <span className="font-normal text-forest-500">@{u.username}</span>
                        {u.role === 'admin' && (
                          <span className="ml-1 rounded-full bg-forest-200 px-2 py-0.5 text-[10px]">
                            Admin
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-forest-500">Yaş: {u.age}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(u)}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-forest-800 ring-1 ring-forest-200"
                      >
                        Düzenle
                      </button>
                      {showShareButtons && (
                        <button
                          type="button"
                          onClick={() => copyLoginInfo(u.username)}
                          className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-forest-800 ring-1 ring-forest-200"
                        >
                          Kopyala
                        </button>
                      )}
                      {u.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => onDeleteUser(u.id)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </li>
                )
              )}
            </ul>

            {!editingUser && !tentFull && canAddCampaignUser ? (
              <form onSubmit={addUser} className="space-y-3 border-t border-forest-100 pt-4">
                <p className="text-sm font-semibold text-forest-900">Yeni kişi ekle</p>
                <p className="text-xs text-forest-500">
                  Mevcut bir kişinin bilgilerini değiştirmek için yukarıdaki{' '}
                  <strong>Düzenle</strong> butonunu kullanın.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <AuthField
                    label="Ad soyad"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    required
                  />
                  <AuthField
                    label="Yaş"
                    type="number"
                    value={userForm.age}
                    onChange={(e) => setUserForm({ ...userForm, age: e.target.value })}
                    required
                  />
                  <AuthField
                    label="Kullanıcı adı"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    required
                  />
                  <AuthField
                    label="Şifre"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required
                  />
                </div>
                <AuthButton type="submit" className="w-full">
                  Kişi ekle
                </AuthButton>
              </form>
            ) : !editingUser && tentFull ? (
              <p className="border-t border-forest-100 pt-4 text-xs text-forest-600">
                Bu çadır dolu (en fazla {maxPerTent} kişi).
                {!canAddCampaignUser && limits?.plan_tier === 'trial' && (
                  <>
                    {' '}
                    <button
                      type="button"
                      onClick={() => setUpgradeOpen(true)}
                      className="font-semibold underline"
                    >
                      Pro ile limiti artırın
                    </button>
                  </>
                )}
              </p>
            ) : !editingUser ? (
              <p className="border-t border-forest-100 pt-4 text-xs text-forest-600">
                Deneme kişi limitine ulaştınız.{' '}
                <button
                  type="button"
                  onClick={() => setUpgradeOpen(true)}
                  className="font-semibold underline"
                >
                  Pro&apos;ya geçin
                </button>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <TentUpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        reason="user"
      />
    </>
  );
}
