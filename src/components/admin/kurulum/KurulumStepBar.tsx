'use client';

import Link from 'next/link';
import { SETUP_STEPS } from '@/lib/admin-setup';

interface KurulumStepBarProps {
  current: number;
  completed: Record<number, boolean>;
}

export default function KurulumStepBar({ current, completed }: KurulumStepBarProps) {
  return (
    <div className="mb-8 overflow-x-auto">
      <ol className="flex min-w-max gap-1">
        {SETUP_STEPS.map((step) => {
          const done = completed[step.id];
          const active = step.id === current;
          return (
            <li key={step.id}>
              <Link
                href={`/admin/kurulum?adim=${step.id}`}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-forest-800 text-white'
                    : done
                      ? 'bg-forest-100 text-forest-800'
                      : 'bg-white text-forest-500 ring-1 ring-forest-100'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                    active ? 'bg-white/20' : done ? 'bg-forest-800 text-white' : 'bg-forest-50'
                  }`}
                >
                  {done && !active ? '✓' : step.id}
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
