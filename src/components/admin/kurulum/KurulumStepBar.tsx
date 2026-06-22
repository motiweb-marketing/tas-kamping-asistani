'use client';

import Link from 'next/link';
import { getWizardStepState, SETUP_STEPS } from '@/lib/admin-setup';

interface KurulumStepBarProps {
  current: number;
}

export default function KurulumStepBar({ current }: KurulumStepBarProps) {
  const currentStep = SETUP_STEPS.find((s) => s.id === current);

  return (
    <div className="mb-8">
      <p className="mb-2 text-sm font-semibold text-forest-800 sm:hidden">
        Adım {current}: {currentStep?.title}
      </p>
      <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ol className="flex min-w-max gap-1.5">
          {SETUP_STEPS.map((step) => {
            const state = getWizardStepState(step.id, current);
            const canNavigate = step.id <= current;

            const pillClass =
              state === 'current'
                ? 'bg-forest-800 text-white shadow-sm'
                : state === 'done'
                  ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200'
                  : 'bg-white text-forest-400 ring-1 ring-forest-100';

            const badgeClass =
              state === 'current'
                ? 'bg-white text-forest-800'
                : state === 'done'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-forest-50 text-forest-400';

            const inner = (
              <>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${badgeClass}`}
                >
                  {state === 'done' ? '✓' : step.id}
                </span>
                <span className="hidden sm:inline">{step.shortTitle}</span>
                {step.optional && state === 'upcoming' && (
                  <span className="hidden text-[10px] font-normal opacity-70 lg:inline">
                    (ops.)
                  </span>
                )}
              </>
            );

            return (
              <li key={step.id}>
                {canNavigate ? (
                  <Link
                    href={`/admin/kurulum?adim=${step.id}`}
                    aria-current={state === 'current' ? 'step' : undefined}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${pillClass}`}
                  >
                    {inner}
                  </Link>
                ) : (
                  <span
                    aria-disabled
                    className={`flex cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${pillClass}`}
                  >
                    {inner}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
      <p className="mt-2 text-xs text-forest-500">
        Adımları sırayla ilerleyin. Yeşil tik = bu adımı geçtiniz.
      </p>
    </div>
  );
}
