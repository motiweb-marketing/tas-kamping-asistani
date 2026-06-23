'use client';

import { setupProgress, type CampSetupProfile } from '@/lib/camp-setup-profile';

interface Props {
  profile: CampSetupProfile;
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function CampSetupProgress({ profile, currentStep, onStepClick }: Props) {
  const { labels } = setupProgress(profile);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-forest-600">
        <span>Kurulum: {currentStep}/{labels.length}</span>
        <span className="font-medium text-forest-800">{labels[currentStep - 1]}</span>
      </div>
      <div className="flex gap-1">
        {labels.map((label, i) => {
          const step = i + 1;
          const active = step === currentStep;
          const done = step < currentStep;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onStepClick?.(step)}
              disabled={!onStepClick}
              title={label}
              className={`h-2 flex-1 rounded-full transition-colors ${
                active ? 'bg-emerald-600' : done ? 'bg-emerald-300' : 'bg-gray-200'
              } ${onStepClick ? 'cursor-pointer' : 'cursor-default'}`}
              aria-label={`${label}${active ? ' (şu an)' : done ? ' (tamam)' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
}
