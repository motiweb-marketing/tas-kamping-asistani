'use client';

import { useMemo } from 'react';
import type { CampSetupProfile, DrinkingBottle } from '@/lib/camp-setup-profile';
import { computeWaterPlan } from '@/lib/water-plan';

interface DayOption {
  date: string;
  title: string;
}

interface Props {
  profile: CampSetupProfile;
  headcount: number;
  campDays: number;
  evenings: DayOption[];
  onPatch: (patch: Partial<CampSetupProfile>) => void;
}

const BOTTLE_OPTIONS: { value: DrinkingBottle; label: string; sub: string }[] = [
  { value: '0.5l', label: '0,5 L şişe', sub: 'Küçük gruplar' },
  { value: '1l', label: '1 L şişe', sub: 'Orta gruplar' },
  { value: '5l', label: '5 L damacana', sub: 'Büyük gruplar' },
];

function formatShortDate(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export default function WaterTeaStep({
  profile,
  headcount,
  campDays,
  evenings,
  onPatch,
}: Props) {
  const water = profile.water;
  const plan = useMemo(
    () => computeWaterPlan(water, headcount, campDays),
    [water, headcount, campDays]
  );

  const recommended = computeWaterPlan(
    { ...water, drinking_bottle: 'recommended' },
    headcount,
    campDays
  );

  function patchWater(patch: Partial<typeof water>) {
    onPatch({ water: { ...water, ...patch } });
  }

  function toggleEvening(date: string) {
    const set = new Set(water.tea_evening_dates);
    if (set.has(date)) set.delete(date);
    else set.add(date);
    patchWater({ tea_evening_dates: Array.from(set) });
  }

  const teaWarning =
    water.tea_enabled && water.tea_evening_dates.length === 0 && evenings.length > 0;

  return (
    <div className="space-y-6">
      <section>
        <h4 className="text-base font-semibold text-forest-950">İçme suyu</h4>
        <p className="mt-1 text-sm text-gray-600">
          Kişi başı günde {water.drinking_liters_per_person_per_day} L (çocuk dahil) — sabit
        </p>
        <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900">
          {headcount} kişi × {campDays} gün = {Math.round(plan.drinking_liters)} L içme suyu
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => patchWater({ drinking_bottle: 'recommended' })}
            className={`min-h-[72px] rounded-xl border-2 p-3 text-left ${
              water.drinking_bottle === 'recommended'
                ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200'
                : 'border-gray-200'
            }`}
          >
            <span className="text-xs font-bold uppercase text-emerald-700">Önerilen</span>
            <p className="mt-1 text-sm font-semibold">
              {recommended.drinking_units}×{' '}
              {recommended.drinking_bottle === '5l'
                ? '5 L damacana'
                : recommended.drinking_bottle === '1l'
                  ? '1 L şişe'
                  : '0,5 L şişe'}
            </p>
          </button>
          {BOTTLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => patchWater({ drinking_bottle: opt.value })}
              className={`min-h-[72px] rounded-xl border-2 p-3 text-left ${
                water.drinking_bottle === opt.value
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-gray-200'
              }`}
            >
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className="text-xs text-gray-500">{opt.sub}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4 className="text-base font-semibold text-forest-950">Akşam çayı / semaver</h4>
        <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-gray-200 p-4">
          <input
            type="checkbox"
            checked={water.tea_enabled}
            onChange={(e) =>
              patchWater({
                tea_enabled: e.target.checked,
                tea_evening_dates: e.target.checked ? water.tea_evening_dates : [],
              })
            }
            className="h-6 w-6"
          />
          <span className="text-sm">Kamp boyunca akşam çayı veya semaver olacak</span>
        </label>

        {water.tea_enabled && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Hangi akşamlar?</p>
                {evenings.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      patchWater({ tea_evening_dates: evenings.map((e) => e.date) })
                    }
                    className="text-sm font-semibold text-emerald-700 underline"
                  >
                    Hepsini seç
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {evenings.map((day) => {
                  const selected = water.tea_evening_dates.includes(day.date);
                  return (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => toggleEvening(day.date)}
                      className={`min-h-[44px] rounded-full px-4 text-sm font-semibold ${
                        selected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {formatShortDate(day.date)}
                    </button>
                  );
                })}
              </div>
              {teaWarning && (
                <p className="mt-2 text-sm text-amber-800">
                  En az bir akşam seçin veya çayı kapatın.
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold">Semaver sayısı</span>
              <button
                type="button"
                onClick={() =>
                  patchWater({ semaver_count: Math.max(1, water.semaver_count - 1) })
                }
                className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-gray-300 text-xl font-bold"
                aria-label="Azalt"
              >
                −
              </button>
              <span className="min-w-[2ch] text-center text-xl font-bold">
                {water.semaver_count}
              </span>
              <button
                type="button"
                onClick={() => patchWater({ semaver_count: water.semaver_count + 1 })}
                className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-gray-300 text-xl font-bold"
                aria-label="Artır"
              >
                +
              </button>
            </div>

            {plan.tea_liters > 0 && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {water.tea_evening_dates.length} akşam × {water.semaver_count} semaver ×{' '}
                {water.liters_per_semaver} L = {plan.tea_liters} L → {plan.tea_damacana_units} adet
                5 L damacana
              </p>
            )}
          </div>
        )}
      </section>

      {plan.summary && (
        <p className="text-xs text-gray-500">{plan.summary}</p>
      )}
    </div>
  );
}
