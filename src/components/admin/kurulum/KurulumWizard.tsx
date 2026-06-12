'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import AuthButton from '@/components/auth/AuthButton';
import {
  SETUP_STEPS,
  firstIncompleteStep,
  getStepCompletion,
  type SetupProgressInput,
} from '@/lib/admin-setup';
import KurulumStepBar from './KurulumStepBar';
import StepFrame from './StepFrame';
import Step1Kamp from './steps/Step1Kamp';
import Step3Ucret from './steps/Step3Ucret';
import Step4MenuGuide from './steps/Step4MenuGuide';
import Step5ListeGuide from './steps/Step5ListeGuide';
import Step6Paylas from './steps/Step6Paylas';
import TentsManager from '@/components/admin/TentsManager';

function KurulumWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adim = Math.min(6, Math.max(1, Number(searchParams.get('adim')) || 1));

  const [progress, setProgress] = useState<SetupProgressInput | null>(null);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  const loadProgress = useCallback(async () => {
    const [campRes, tentsRes, usersRes, itemsRes, menusRes, menuDayRes] = await Promise.all([
      fetch('/api/campaign'),
      fetch('/api/tents'),
      fetch('/api/users'),
      fetch('/api/items?scope=shared'),
      fetch('/api/menus'),
      fetch('/api/menus/day'),
    ]);
    const camp = (await campRes.json()).campaign;
    const tents = (await tentsRes.json()).tents || [];
    const users = (await usersRes.json()).users || [];
    const items = (await itemsRes.json()).items || [];
    const menus = (await menusRes.json()).menus || [];
    const menuDay = await menuDayRes.json();
    const hasMenuContent = (menuDay.days || []).some(
      (d: { breakfast?: string; meal?: string; snack?: string }) =>
        d.breakfast?.trim() || d.meal?.trim() || d.snack?.trim()
    );

    const input: SetupProgressInput = {
      campaignName: camp?.name || '',
      hasDates: !!(camp?.start_date && camp?.end_date),
      tentCount: tents.length,
      userCount: users.length,
      menuCount: menus.length > 0 ? menus.length : hasMenuContent ? 1 : 0,
      itemCount: items.length,
      isMenuPublished: !!menuDay.is_published,
      hasPublishedItems: items.length > 0,
    };
    setProgress(input);
    const comp = getStepCompletion(input);
    if (typeof window !== 'undefined') {
      try {
        if (localStorage.getItem('kamp-asistani-shared-creds')) comp[6] = true;
      } catch { /* ignore */ }
    }
    setCompleted(comp);
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress, adim]);

  useEffect(() => {
    if (!searchParams.get('adim') && progress) {
      const first = firstIncompleteStep(getStepCompletion(progress));
      router.replace(`/admin/kurulum?adim=${first}`);
    }
  }, [searchParams, progress, router]);

  const step = SETUP_STEPS.find((s) => s.id === adim)!;

  function goTo(next: number) {
    router.push(`/admin/kurulum?adim=${next}`);
    loadProgress();
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-forest-950">Kamp kurulum sihirbazı</h1>
        <p className="mt-1 text-sm text-forest-600">
          Adım adım ilerleyin. Her bilgiyi sonra sol menüden düzenleyebilirsiniz.
        </p>
      </header>

      <KurulumStepBar current={adim} completed={completed} />

      <StepFrame title={step.title} description={step.description}>
        {adim === 1 && <Step1Kamp onSaved={loadProgress} />}
        {adim === 2 && <TentsManager showShareButtons={false} />}
        {adim === 3 && <Step3Ucret />}
        {adim === 4 && <Step4MenuGuide />}
        {adim === 5 && <Step5ListeGuide />}
        {adim === 6 && <Step6Paylas />}
      </StepFrame>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        {adim > 1 ? (
          <AuthButton type="button" variant="secondary" onClick={() => goTo(adim - 1)} className="sm:w-auto sm:min-w-[140px]">
            ← Geri
          </AuthButton>
        ) : (
          <div />
        )}
        {adim < 6 ? (
          <AuthButton type="button" onClick={() => goTo(adim + 1)} className="sm:ml-auto sm:w-auto sm:min-w-[140px]">
            İleri →
          </AuthButton>
        ) : (
          <Link href="/admin" className="sm:ml-auto">
            <AuthButton type="button">Kurulumu bitir — panele git</AuthButton>
          </Link>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-forest-500">
        Bu adımı sonra düzenlemek için:{' '}
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
