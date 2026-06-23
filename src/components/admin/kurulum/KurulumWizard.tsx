'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import AuthAlert from '@/components/auth/AuthAlert';
import AuthButton from '@/components/auth/AuthButton';
import { canAdvanceFromStep, SETUP_STEPS, type SetupProgressInput } from '@/lib/admin-setup';
import {
  TOUR_STEP_TIPS,
  completeLeaderOnboarding,
  enableAdminPulse,
  isAdminTourDone,
  isLeaderOnboardingActive,
  markAdminTourDone,
} from '@/lib/admin-tour';
import KurulumStepBar from './KurulumStepBar';
import StepFrame from './StepFrame';
import Step1Kamp from './steps/Step1Kamp';
import Step3Ucret from './steps/Step3Ucret';
import Step4MenuGuide from './steps/Step4MenuGuide';
import Step5ListeGuide from './steps/Step5ListeGuide';
import Step6Paylas from './steps/Step6Paylas';
import TourWelcome from './TourWelcome';
import TentsManager from '@/components/admin/TentsManager';
import LeaderKurulumBubble from '@/components/onboarding/LeaderKurulumBubble';

function KurulumWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adim = Math.min(6, Math.max(1, Number(searchParams.get('adim')) || 1));

  const [showWelcome, setShowWelcome] = useState(false);
  const [leaderMode, setLeaderMode] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [tentCount, setTentCount] = useState(0);
  const [progress, setProgress] = useState<SetupProgressInput>({
    campaignName: '',
    hasDates: false,
    tentCount: 0,
    userCount: 0,
    menuCount: 0,
    itemCount: 0,
    isMenuPublished: false,
    hasPublishedItems: false,
  });
  const [advanceError, setAdvanceError] = useState('');

  const loadProgress = useCallback(async () => {
    const [campaignRes, usersRes, tentsRes, menusRes, itemsRes] = await Promise.all([
      fetch('/api/campaign'),
      fetch('/api/users'),
      fetch('/api/tents'),
      fetch('/api/menus'),
      fetch('/api/items?scope=shared'),
    ]);
    const [campaignData, usersData, tentsData, menusData, itemsData] = await Promise.all([
      campaignRes.json(),
      usersRes.json(),
      tentsRes.json(),
      menusRes.json(),
      itemsRes.json(),
    ]);

    const campaign = campaignData.campaign;
    const menus = (menusData.menus || []).filter((m: { description?: string }) => m.description?.trim());
    const items = itemsData.items || [];
    const users = usersData.users || [];
    const tents = tentsData.tents || [];

    setUserCount(users.length);
    setTentCount(tents.length);
    setProgress({
      campaignName: campaign?.name || '',
      hasDates: !!(campaign?.start_date && campaign?.end_date),
      tentCount: tents.length,
      userCount: users.length,
      menuCount: menus.length,
      itemCount: items.length,
      isMenuPublished: menus.length > 0,
      hasPublishedItems: items.some((i: { is_published: boolean }) => i.is_published),
    });
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress, adim]);

  useEffect(() => {
    const leader = searchParams.get('leader') === '1' || isLeaderOnboardingActive();
    setLeaderMode(leader);
    if (leader) {
      enableAdminPulse();
      return;
    }
    const welcome = searchParams.get('welcome') === '1';
    const tourDone = isAdminTourDone();
    if ((welcome || !tourDone) && !searchParams.get('adim')) {
      setShowWelcome(true);
    }
  }, [searchParams]);

  const step = SETUP_STEPS.find((s) => s.id === adim)!;
  const tip = TOUR_STEP_TIPS[adim];
  const leaderGuide = leaderMode;

  function goTo(next: number) {
    setAdvanceError('');
    const leaderQ = leaderMode ? '&leader=1' : '';
    router.push(`/admin/kurulum?adim=${next}${leaderQ}`);
  }

  function handleNext() {
    const check = canAdvanceFromStep(adim, progress);
    if (!check.ok) {
      setAdvanceError(check.message || 'Bu adımı tamamlayın.');
      return;
    }
    if (check.message) {
      setAdvanceError('');
    }
    goTo(adim + 1);
  }

  function skipTour() {
    markAdminTourDone();
    completeLeaderOnboarding();
    setShowWelcome(false);
    router.push('/admin');
  }

  function startTour() {
    setShowWelcome(false);
    router.replace('/admin/kurulum?adim=1');
  }

  function finishTour() {
    markAdminTourDone();
    completeLeaderOnboarding();
    router.push('/admin');
  }

  return (
    <div>
      {showWelcome && !leaderMode && <TourWelcome onStart={startTour} onSkip={skipTour} />}

      <LeaderKurulumBubble step={adim} />

      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-forest-950 sm:text-2xl">
            Kamp kurulum sihirbazı
          </h1>
          <p className="mt-1 text-sm text-forest-600">
            Adım {adim} / {SETUP_STEPS.length} — Bilgileri adım adım tamamlayın, sonra düzenleme
            ekranlarına geçin.
          </p>
        </div>
        <button
          type="button"
          onClick={skipTour}
          className="shrink-0 self-start text-sm font-semibold text-forest-500 underline hover:text-forest-800"
        >
          Sihirbazı atla
        </button>
      </header>

      <KurulumStepBar current={adim} />

      <StepFrame
        title={step.title}
        description={leaderGuide ? '' : tip.body}
        bullets={leaderGuide ? undefined : tip.bullets}
        highlight={adim === 2 && userCount < 2}
      >
        {adim === 1 && <Step1Kamp onSaved={loadProgress} />}
        {adim === 2 && (
          <TentsManager
            showShareButtons={false}
            tourMode
            onUsersChange={(count) => {
              setUserCount(count);
              loadProgress();
            }}
          />
        )}
        {adim === 3 && <Step3Ucret />}
        {adim === 4 && <Step4MenuGuide onSkipped={() => goTo(5)} />}
        {adim === 5 && <Step5ListeGuide />}
        {adim === 6 && <Step6Paylas />}
      </StepFrame>

      {advanceError && (
        <div className="mt-4">
          <AuthAlert>{advanceError}</AuthAlert>
        </div>
      )}

      {adim === 2 && userCount < 2 && tentCount >= 1 && (
        <p className="mt-4 text-sm text-amber-800">
          Deneme sürümünde en az 2 kişi eklemeniz önerilir — katılımcıları şimdi ekleyin.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        {adim > 1 ? (
          <AuthButton
            type="button"
            variant="secondary"
            onClick={() => goTo(adim - 1)}
            className="sm:w-auto sm:min-w-[140px]"
          >
            ← Geri
          </AuthButton>
        ) : (
          <div />
        )}
        {adim < 6 ? (
          <AuthButton
            type="button"
            onClick={handleNext}
            className="sm:ml-auto sm:w-auto sm:min-w-[140px]"
          >
            İleri →
          </AuthButton>
        ) : (
          <AuthButton type="button" onClick={finishTour} className="sm:ml-auto sm:min-w-[200px]">
            Kurulumu bitir — panele git
          </AuthButton>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-forest-500">
        Bu bölümü sonra düzenlemek için:{' '}
        <Link href={step.editHref} className="font-semibold underline">
          {step.title}
        </Link>
      </p>
    </div>
  );
}

export default function KurulumWizard() {
  return (
    <Suspense fallback={<p className="text-sm text-forest-500">Yükleniyor...</p>}>
      <KurulumWizardInner />
    </Suspense>
  );
}
