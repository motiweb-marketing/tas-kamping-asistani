'use client';

import {
  CAMP_SITE_LABELS,
  type CampSetupProfile,
  type CampSiteType,
} from '@/lib/camp-setup-profile';

const OPTIONS: { type: CampSiteType; icon: string; hint: string }[] = [
  { type: 'ready_tent', icon: '⛺', hint: 'Hazır kurulu çadır veya glamping' },
  { type: 'bungalow', icon: '🏡', hint: 'Kulübe, bungalov veya karavan' },
  { type: 'own_tent_campground', icon: '🏕️', hint: 'Resmi kamp alanında kendi çadırınız' },
  { type: 'own_tent_wild', icon: '🌲', hint: 'Orman, dağ veya sahil — vahşi kamp' },
];

interface Props {
  profile: CampSetupProfile;
  onSelect: (type: CampSiteType) => void;
  saving?: boolean;
}

export default function CampSiteTypeStep({ profile, onSelect, saving }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Kamp tipinizi seçin. Sonraki adımda birkaç kısa soru soracağız.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map(({ type, icon, hint }) => {
          const selected = profile.camp_site_type === type;
          return (
            <button
              key={type}
              type="button"
              disabled={saving}
              onClick={() => onSelect(type)}
              className={`min-h-[88px] rounded-xl border-2 p-4 text-left transition-colors ${
                selected
                  ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200'
                  : 'border-gray-200 bg-white hover:border-emerald-300'
              } disabled:opacity-50`}
            >
              <span className="text-2xl" aria-hidden>
                {icon}
              </span>
              <p className="mt-2 text-base font-semibold text-forest-950">
                {CAMP_SITE_LABELS[type]}
              </p>
              <p className="mt-1 text-sm text-gray-600">{hint}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
