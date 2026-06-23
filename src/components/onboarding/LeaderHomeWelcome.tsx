'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CoachBubble from '@/components/onboarding/CoachBubble';
import {
  LEADER_SCRIPT,
  completeLeaderOnboarding,
  enableAdminPulse,
  isLeaderOnboardingActive,
} from '@/lib/admin-tour';

export default function LeaderHomeWelcome() {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const leaderParam = searchParams.get('leader') === '1';
    if (leaderParam) {
      enableAdminPulse();
      setVisible(true);
      return;
    }
    if (isLeaderOnboardingActive()) {
      setVisible(true);
    }
  }, [searchParams]);

  if (!visible) return null;

  const intro = LEADER_SCRIPT[0];

  return (
    <div className="mb-4">
      <CoachBubble
        title={intro.title}
        body={intro.body}
        cta="Admin paneline geç"
        onNext={() => setVisible(false)}
        onSkip={() => {
          completeLeaderOnboarding();
          setVisible(false);
        }}
        skipLabel="Rehberi kapat"
      />
    </div>
  );
}
