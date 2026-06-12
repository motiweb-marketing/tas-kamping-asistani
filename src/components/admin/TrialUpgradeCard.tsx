import ContactCtaButtons from '@/components/landing/ContactCtaButtons';
import type { CampaignLimits } from '@/lib/campaign-limits';

interface TrialUpgradeCardProps {
  limits: CampaignLimits;
  showAlways?: boolean;
}

export default function TrialUpgradeCard({ limits, showAlways }: TrialUpgradeCardProps) {
  if (limits.plan_tier !== 'trial' && !showAlways) return null;

  const atLimit = !limits.can_add_tent || !limits.can_add_user;

  return (
    <div
      className={`rounded-xl border-2 p-4 ${
        atLimit ? 'border-amber-400 bg-amber-50' : 'border-blue-200 bg-blue-50'
      }`}
    >
      <h3 className="font-semibold text-gray-900">
        {atLimit ? 'Deneme limitine ulaştınız' : 'Ücretsiz deneme'}
      </h3>
      <p className="mt-1 text-sm text-gray-700">
        {limits.tents_used}/{limits.max_tents} çadır · {limits.users_used}/{limits.max_users} kişi
        kullanılıyor.
        {atLimit
          ? ' Daha fazla çadır veya kişi için tam sürüme geçin.'
          : ' Tam sürümde sınırsız çadır ve katılımcı.'}
      </p>
      <ContactCtaButtons
        message={`Kamp Asistanı tam sürüm — ${limits.tents_used} çadır, ${limits.users_used} kişi kullanılıyor.`}
        className="mt-4"
      />
    </div>
  );
}
