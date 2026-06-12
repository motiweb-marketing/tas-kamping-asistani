'use client';

import Link from 'next/link';
import { SETUP_STEPS } from '@/lib/admin-setup';

interface KurulumStepBarProps {
  current: number;
}

export default function KurulumStepBar({ current }: KurulumStepBarProps) {
  return (
    <div className="mb-8 overflow-x-auto">
      <ol className="flex min-w-max gap-1.5">
        {SETUP_STEPS.map((step) => {
          const active = step.id === current;
          const past = step.id < current;

          return (
            <li key={step.id}>
              <Link
                href={`/admin/kurulum?adim=${step.id}`}
                aria-current={active ? 'step' : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-forest-800 text-white shadow-sm'
                    : past
                      ? 'bg-forest-100 text-forest-800 ring-1 ring-forest-200'
                      : 'bg-white text-forest-500 ring-1 ring-forest-100'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    active
                      ? 'bg-white text-forest-800'
                      : past
                        ? 'bg-forest-700 text-white'
                        : 'bg-forest-50 text-forest-500'
                  }`}
                >
                  {step.id}
                </span>
                <span className="hidden sm:inline">{step.shortTitle}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
