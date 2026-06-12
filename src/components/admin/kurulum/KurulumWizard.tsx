'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import AuthButton from '@/components/auth/AuthButton';
import { SETUP_STEPS } from '@/lib/admin-setup';
import { TOUR_STEP_TIPS, isAdminTourDone, markAdminTourDone } from '@/lib/admin-tour';
import KurulumStepBar from './KurulumStepBar';
import StepFrame from './StepFrame';
import Step1Kamp from './steps/Step1Kamp';
import Step3Ucret from './steps/Step3Ucret';
import Step4MenuGuide from './steps/Step4MenuGuide';
import Step5ListeGuide from './steps/Step5ListeGuide';
import Step6Paylas from './steps/Step6Paylas';
import TourTip from './TourTip';
import TourWelcome from './TourWelcome';
import TentsManager from '@/components/admin/TentsManager';

function KurulumWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adim = Math.min(6, Math.max(1, Number(searchParams.get('adim')) || 1));

  const [showWelcome, setShowWelcome] = useState(false);
  const [userCount, setUserCount] = useState(0);

  const loadUserCount = useCallback(async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUserCount((data.users || []).length);
  }, []);

  useEffect(() => {
    loadUserCount();
  }, [loadUserCount, adim]);

  useEffect(() => {
    const welcome = searchParams.get('welcome') === '1';
    const tourDone = isAdminTourDone();
    if ((welcome || !tourDone) && !searchParams.get('adim')) {
      setShowWelcome(true);
    }
  }, [searchParams]);

  const step = SETUP_STEPS.find((s) => s.id === adim)!;
  const tip = TOUR_STEP_TIPS[adim];

  function goTo(next: number) {
    router.push(`/admin/kurulum?adim=${next}`);
  }

  function skipTour() {
    markAdminTourDone();
    setShowWelcome(false);
    router.push('/admin');
  }

  function startTour() {
    setShowWelcome(false);
    router.replace('/admin/kurulum?adim=1');
  }

  function finishTour() {
    markAdminTourDone();
    router.push('/admin');
  }

  return (
    <div>
      {showWelcome && <TourWelcome onStart={startTour} onSkip={skipTour} />}

      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-forest-950 sm:text-2xl">Program tanıtımı</h1>
          <p className="mt-1 text-sm text-forest-600">
            Adım {adim} / {SETUP_STEPS.length} — Kamp Asistanı&apos;nın nasıl çalıştığını öğrenin.
          </p>
        </div>
        <button
          type="button"
          onClick={skipTour}
          className="shrink-0 self-start text-sm font-semibold text-forest-500 underline hover:text-forest-800"
        >
          Tanıtımı atla
        </button>
      </header>

      <KurulumStepBar current={adim} />

      <TourTip
        tip={tip}
        variant={adim === 2 && userCount < 2 ? 'highlight' : 'default'}
      />

      <StepFrame title={step.title} description={step.description}>
        {adim === 1 && <Step1Kamp />}
        {adim === 2 && (
          <TentsManager
            showShareButtons={false}
            tourMode
            onUsersChange={setUserCount}
          />
        )}
        {adim === 3 && <Step3Ucret />}
        {adim === 4 && <Step4MenuGuide />}
        {adim === 5 && <Step5ListeGuide />}
        {adim === 6 && <Step6Paylas />}
      </StepFrame>

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
            onClick={() => goTo(adim + 1)}
            className="sm:ml-auto sm:w-auto sm:min-w-[140px]"
          >
            İleri →
          </AuthButton>
        ) : (
          <AuthButton type="button" onClick={finishTour} className="sm:ml-auto sm:min-w-[200px]">
            Tanıtımı bitir — panele git
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
