import type { PlanTier } from '@/lib/campaign-limits';

interface PlanBadgeProps {
  planTier: PlanTier;
}

export default function PlanBadge({ planTier }: PlanBadgeProps) {
  const isTrial = planTier === 'trial';
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
        isTrial ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
      }`}
    >
      {isTrial ? 'Deneme' : 'Pro'}
    </span>
  );
}
