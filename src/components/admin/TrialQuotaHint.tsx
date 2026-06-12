import Link from 'next/link';
import type { CampaignLimits } from '@/lib/campaign-limits';

interface TrialQuotaHintProps {
  limits: CampaignLimits;
}

/** Deneme kotası — kalan hak varsa teşvik, bitince yumuşak uyarı */
export default function TrialQuotaHint({ limits }: TrialQuotaHintProps) {
  if (limits.plan_tier !== 'trial') return null;

  const usersLeft = limits.max_users - limits.users_used;
  const tentsLeft = limits.max_tents - limits.tents_used;
  const fullyUsed = usersLeft <= 0 && tentsLeft <= 0;

  if (fullyUsed) {
    return (
      <p className="rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-xs text-forest-700">
        Deneme hakkınız doldu. Daha fazla çadır veya kişi için{' '}
        <Link href="/admin/pro" className="font-semibold text-forest-900 underline">
          Pro sürüme geçin
        </Link>
        .
      </p>
    );
  }

  const parts: string[] = [];
  if (usersLeft > 0) {
    parts.push(`${usersLeft} kişi daha ekleyebilirsiniz`);
  }
  if (tentsLeft > 0) {
    parts.push(`${tentsLeft} çadır daha ekleyebilirsiniz`);
  }

  if (parts.length === 0) return null;

  return (
    <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
      Deneme sürümünde {parts.join(' · ')}.
    </p>
  );
}
