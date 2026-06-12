import Link from 'next/link';
import type { CampaignLimits } from '@/lib/campaign-limits';

interface TrialLimitHintProps {
  limits: CampaignLimits;
}

/** Küçük satır içi uyarı — sadece limite ulaşıldığında */
export default function TrialLimitHint({ limits }: TrialLimitHintProps) {
  if (limits.plan_tier !== 'trial') return null;
  const atLimit = !limits.can_add_tent || !limits.can_add_user;
  if (!atLimit) return null;

  return (
    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      Deneme limitine ulaştınız ({limits.tents_used}/{limits.max_tents} çadır,{' '}
      {limits.users_used}/{limits.max_users} kişi).{' '}
      <Link href="/admin/pro" className="font-semibold underline">
        Pro&apos;ya geçin
      </Link>
    </p>
  );
}
