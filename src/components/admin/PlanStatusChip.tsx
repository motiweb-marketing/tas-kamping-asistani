'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CampaignLimits } from '@/lib/campaign-limits';

export default function PlanStatusChip({ className = '' }: { className?: string }) {
  const [limits, setLimits] = useState<CampaignLimits | null>(null);

  useEffect(() => {
    fetch('/api/campaign')
      .then((r) => r.json())
      .then((d) => setLimits(d.limits || null));
  }, []);

  if (!limits) return null;

  const isTrial = limits.plan_tier === 'trial';
  const atLimit = !limits.can_add_tent || !limits.can_add_user;

  if (!isTrial) {
    return (
      <div className={`rounded-lg bg-emerald-50 px-3 py-2 text-center ${className}`}>
        <span className="text-xs font-bold uppercase tracking-wide text-emerald-800">Pro</span>
        <p className="mt-0.5 text-[10px] text-emerald-700">Tam sürüm aktif</p>
      </div>
    );
  }

  return (
    <Link
      href="/admin/pro"
      className={`block rounded-lg border px-3 py-2 transition-colors hover:bg-amber-50 ${
        atLimit ? 'border-amber-300 bg-amber-50' : 'border-amber-200 bg-amber-50/60'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-amber-900">Deneme</span>
        {atLimit && (
          <span className="rounded-full bg-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-900">
            Limit
          </span>
        )}
      </div>
      <p className="mt-0.5 text-[10px] leading-snug text-amber-800">
        {limits.tents_used}/{limits.max_tents} çadır · {limits.users_used}/{limits.max_users} kişi
      </p>
    </Link>
  );
}
