'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { tentCapacity, type CampaignLimits } from '@/lib/campaign-limits';
import type { SafeUser, Tent } from '@/types';

interface Props {
  tents: Tent[];
  users: SafeUser[];
  limits: CampaignLimits | null;
  highlightTentId?: string | null;
  onRefresh: () => void;
  onError: (msg: string) => void;
}

export default function TentPeopleBoard({
  tents,
  users,
  limits,
  highlightTentId,
  onRefresh,
  onError,
}: Props) {
  const [dragUserId, setDragUserId] = useState<string | null>(null);
  const [overTentId, setOverTentId] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [moveMenuUserId, setMoveMenuUserId] = useState<string | null>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!highlightTentId) return;
    const el = columnRefs.current[highlightTentId];
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [highlightTentId]);

  const unassigned = users.filter((u) => !u.tent_id);

  function usersInTent(tentId: string) {
    return users.filter((u) => u.tent_id === tentId);
  }

  function capFor(tent: Tent) {
    return limits ? tentCapacity(tent, limits.plan_tier) : tent.max_capacity ?? 4;
  }

  async function moveUser(userId: string, tentId: string) {
    const user = users.find((u) => u.id === userId);
    if (!user || user.tent_id === tentId) return;

    const tent = tents.find((t) => t.id === tentId);
    if (!tent) return;

    const count = usersInTent(tentId).length;
    const cap = capFor(tent);
    if (count >= cap) {
      onError(`"${tent.name}" dolu (${cap} kişi).`);
      return;
    }

    setMoving(true);
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tent_id: tentId }),
    });
    const data = await res.json();
    setMoving(false);
    setMoveMenuUserId(null);
    setDragUserId(null);
    setOverTentId(null);

    if (!res.ok) {
      onError(data.error || 'Taşınamadı');
      return;
    }
    onRefresh();
  }

  const handleDrop = useCallback(
    (tentId: string) => {
      if (dragUserId) void moveUser(dragUserId, tentId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dragUserId, users, tents]
  );

  function renderUserChip(user: SafeUser) {
    const showMoveMenu = moveMenuUserId === user.id;

    return (
      <div
        key={user.id}
        draggable={!moving}
        onDragStart={(e) => {
          setDragUserId(user.id);
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', user.id);
        }}
        onDragEnd={() => {
          setDragUserId(null);
          setOverTentId(null);
        }}
        className={`rounded-xl border bg-white px-3 py-2 shadow-sm ${
          dragUserId === user.id ? 'border-emerald-500 opacity-60' : 'border-forest-100'
        }`}
      >
        <div className="flex items-start gap-2">
          <span
            className="mt-0.5 cursor-grab text-forest-300 active:cursor-grabbing"
            aria-hidden
          >
            <GripVertical className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-forest-950">{user.name}</p>
            <p className="truncate text-xs text-forest-500">@{user.username}</p>
          </div>
          <button
            type="button"
            onClick={() => setMoveMenuUserId(showMoveMenu ? null : user.id)}
            className="shrink-0 rounded-lg bg-forest-50 px-2 py-1 text-[10px] font-bold uppercase text-forest-600 sm:hidden"
          >
            Taşı
          </button>
        </div>

        {showMoveMenu && (
          <div className="mt-2 flex flex-wrap gap-1 border-t border-forest-100 pt-2">
            {tents.map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={moving || user.tent_id === t.id}
                onClick={() => void moveUser(user.id, t.id)}
                className="min-h-[36px] rounded-full bg-forest-100 px-3 text-xs font-semibold text-forest-800 disabled:opacity-40"
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderColumn(tent: Tent | null, tentUsers: SafeUser[], key: string) {
    const tentId = tent?.id ?? '__unassigned__';
    const isHighlight = tent && highlightTentId === tent.id;
    const isOver = overTentId === tentId;
    const cap = tent ? capFor(tent) : null;

    return (
      <div
        key={key}
        ref={(el) => {
          if (tent) columnRefs.current[tent.id] = el;
        }}
        className={`flex w-[min(100%,280px)] shrink-0 flex-col rounded-2xl border-2 transition-colors ${
          isOver
            ? 'border-emerald-500 bg-emerald-50'
            : isHighlight
              ? 'border-forest-500 bg-forest-50/50'
              : 'border-forest-100 bg-forest-50/30'
        }`}
        {...(tent
          ? {
              onDragOver: (e: React.DragEvent) => {
                if (!dragUserId) return;
                e.preventDefault();
                setOverTentId(tent.id);
              },
              onDragLeave: () => setOverTentId(null),
              onDrop: (e: React.DragEvent) => {
                e.preventDefault();
                handleDrop(tent.id);
              },
            }
          : {})}
      >
        <div className="border-b border-forest-100 px-3 py-3">
          <p className="text-sm font-bold text-forest-950">
            {tent ? `⛺ ${tent.name}` : '⚠️ Çadırsız'}
          </p>
          <p className="text-xs text-forest-500">
            {tentUsers.length}
            {cap != null ? ` / ${cap}` : ''} kişi
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-2">
          {tentUsers.length === 0 && (
            <p className="rounded-lg border border-dashed border-forest-200 px-2 py-6 text-center text-xs text-forest-400">
              {tent ? 'Buraya sürükleyin' : 'Çadır atayın'}
            </p>
          )}
          {tentUsers.map(renderUserChip)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-forest-600">
        Kişileri sürükleyip başka çadıra bırakın. Mobilde <strong>Taşı</strong> butonunu
        kullanın.
      </p>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {unassigned.length > 0 && renderColumn(null, unassigned, '__unassigned__')}
        {tents.map((tent) => renderColumn(tent, usersInTent(tent.id), tent.id))}
      </div>
      {moving && <p className="text-sm text-forest-500">Taşınıyor...</p>}
    </div>
  );
}
