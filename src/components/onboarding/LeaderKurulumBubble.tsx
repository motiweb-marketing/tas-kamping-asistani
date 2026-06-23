'use client';

import { useEffect, useState } from 'react';
import CoachBubble from '@/components/onboarding/CoachBubble';
import {
  completeLeaderOnboarding,
  getLeaderBubble,
  isLeaderOnboardingActive,
} from '@/lib/admin-tour';

export default function LeaderKurulumBubble({ step }: { step: number }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [step]);

  const bubble = getLeaderBubble(step);
  if (!bubble || !isLeaderOnboardingActive() || dismissed) return null;

  return (
    <div className="mb-4">
      <CoachBubble
        title={bubble.title}
        body={bubble.body}
        cta={bubble.cta}
        onNext={() => {
          setDismissed(true);
          if (step >= 6) completeLeaderOnboarding();
        }}
        onSkip={() => completeLeaderOnboarding()}
        skipLabel="Rehberi kapat"
      />
    </div>
  );
}
