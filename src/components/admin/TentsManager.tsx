'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import TentDetailModal from '@/components/admin/TentDetailModal';
import TentUpgradeModal from '@/components/admin/TentUpgradeModal';
import TrialQuotaHint from '@/components/admin/TrialQuotaHint';
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

export default function TentsManager({
  showShareButtons = true,
  tourMode = false,
  onUsersChange,
}: {
  showShareButtons?: boolean;
  tourMode?: boolean;
  onUsersChange?: (count: number) => void;
}) {
  const [tents, setTents] = useState<Tent[]>([]);
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [limits, setLimits] = useState<CampaignLimits | null>(null);
  const [selectedTent, setSelectedTent] = useState<Tent | null>(null);
  const [showAddTent, setShowAddTent] = useState(false);
  const [tentName, setTentName] = useState('');
  const [upgradeReason, setUpgradeReason] = useState<'tent' | 'user' | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [tRes, uRes, cRes] = await Promise.all([
      fetch('/api/tents'),
      fetch('/api/users'),
      fetch('/api/campaign'),
    ]);
    const tData = await tRes.json();
    const uData = await uRes.json();
    const cData = await cRes.json();
    const loadedUsers = uData.users || [];
    const loadedTents = tData.tents || [];
    setTents(loadedTents);
    setUsers(loadedUsers);
    setLimits(cData.limits || null);
    onUsersChange?.(loadedUsers.length);
    setSelectedTent((prev) =>
      prev ? loadedTents.find((t: Tent) => t.id === prev.id) || null : null
    );
  }, [onUsersChange]);

  useEffect(() => {
    load();
  }, [load]);

  function usersInTent(tentId: string) {
    return users.filter((u) => u.tent_id === tentId);
  }

  function handleAddTentClick() {
    if (limits && !limits.can_add_tent) {
      setUpgradeReason('tent');
      return;
    }
    setShowAddTent(true);
    setTentName('');
    setError('');
  }

  async function submitAddTent(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/tents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tentName }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 403) {
        setShowAddTent(false);
        setUpgradeReason('tent');
        return;
      }
      setError(data.error || 'Çadır eklenemedi');
      return;
    }
    setShowAddTent(false);
    setTentName('');
    await load();
    if (data.tent) setSelectedTent(data.tent);
  }

  async function deleteUser(id: string) {
    if (!confirm('Bu kişiyi silmek istediğinize emin misiniz?')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (!res.ok) setError((await res.json()).error || 'Silinemedi');
    else load();
  }

  const maxPerTent = limits?.max_users_per_tent ?? 4;

  return (
    <div className="space-y-6">
      {limits && !tourMode && <TrialQuotaHint limits={limits} />}
      {error && <AuthAlert>{error}</AuthAlert>}

      {tourMode && users.length < 2 && (
        <div className="rounded-xl border-2 border-dashed border-forest-300 bg-forest-50/80 px-4 py-3 text-sm text-forest-800">
          <strong>Şu an {users.length} kişi var</strong> (organizatör — siz).
          Bir çadır kartına tıklayıp <strong>en az 1 katılımcı daha</strong> ekleyin.
        </div>
      )}

      {tourMode && users.length >= 2 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Harika — {users.length} kişi eklendi. Katılımcılar giriş yapınca listeyi, harcamayı ve nöbeti görebilir.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tents.map((tent) => {
          const count = usersInTent(tent.id).length;
          const full = count >= maxPerTent;
          return (
            <button
              key={tent.id}
              type="button"
              onClick={() => setSelectedTent(tent)}
              className="group flex min-h-[120px] flex-col items-center justify-center rounded-2xl border-2 border-forest-200 bg-white p-4 text-center shadow-sm transition-all hover:border-forest-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-forest-400"
            >
              <span className="text-3xl" aria-hidden>
                ⛺
              </span>
              <span className="mt-2 line-clamp-2 text-sm font-bold text-forest-950">{tent.name}</span>
              <span className="mt-1 text-xs text-forest-500">
                {count}/{maxPerTent} kişi
                {full && <span className="text-amber-700"> · dolu</span>}
              </span>
              <span className="mt-2 text-[10px] font-medium text-forest-400 opacity-0 transition-opacity group-hover:opacity-100">
                Detay için tıkla
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleAddTentClick}
          className="flex min-h-[120px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-forest-200 bg-forest-50/40 p-4 text-forest-400 transition-colors hover:border-forest-300 hover:bg-forest-50 hover:text-forest-600"
        >
          <Plus className="h-8 w-8 opacity-50" strokeWidth={1.5} />
          <span className="mt-2 text-sm font-semibold">Çadır ekle</span>
        </button>
      </div>

      {selectedTent && (
        <TentDetailModal
          tent={selectedTent}
          users={users}
          limits={limits}
          showShareButtons={showShareButtons}
          onClose={() => setSelectedTent(null)}
          onRefresh={load}
          onDeleteUser={deleteUser}
        />
      )}

      {showAddTent && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-forest-950/40 p-4 sm:items-center"
          onClick={() => setShowAddTent(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="font-display text-lg font-bold text-forest-950">Yeni çadır</h3>
            <form onSubmit={submitAddTent} className="mt-4 space-y-4">
              <AuthField
                label="Çadır adı"
                value={tentName}
                onChange={(e) => setTentName(e.target.value)}
                placeholder="ör: Büyük Kaçar Ailesi"
                required
                autoFocus
              />
              <div className="flex gap-2">
                <AuthButton type="button" variant="secondary" onClick={() => setShowAddTent(false)} className="flex-1">
                  İptal
                </AuthButton>
                <AuthButton type="submit" className="flex-1">
                  Ekle
                </AuthButton>
              </div>
            </form>
          </div>
        </div>
      )}

      <TentUpgradeModal
        open={upgradeReason !== null}
        onClose={() => setUpgradeReason(null)}
        reason={upgradeReason || 'tent'}
      />
    </div>
  );
}
