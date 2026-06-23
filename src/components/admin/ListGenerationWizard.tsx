'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AiListGeneratingScreen from '@/components/admin/AiListGeneratingScreen';
import {
  DEFAULT_LIST_GENERATION_CONTEXT,
  type ListGenerationContext,
} from '@/lib/list-generation-context';

interface Readiness {
  ready: boolean;
  errors: string[];
  participantCount: number;
  adultCount: number;
  childCount: number;
  tentCount: number;
  usersWithoutTent: number;
  hasMenu: boolean;
  listBaselineHeadcount: number | null;
  minParticipants: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onGenerate: (context: ListGenerationContext) => Promise<void>;
  generating: boolean;
  generateError?: string;
}

export default function ListGenerationWizard({
  open,
  onClose,
  onGenerate,
  generating,
  generateError = '',
}: Props) {
  const [step, setStep] = useState(1);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<ListGenerationContext>({
    ...DEFAULT_LIST_GENERATION_CONTEXT,
  });
  const [lastContext, setLastContext] = useState<ListGenerationContext | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setContext({ ...DEFAULT_LIST_GENERATION_CONTEXT });
    setLoading(true);
    fetch('/api/ai/list-readiness')
      .then((r) => r.json())
      .then((data) => setReadiness(data))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  function update<K extends keyof ListGenerationContext>(key: K, value: ListGenerationContext[K]) {
    setContext((prev) => ({ ...prev, [key]: value }));
  }

  const canProceedStep1 =
    readiness?.ready &&
    context.headcount_confirmed &&
    readiness.participantCount >= (readiness.minParticipants || 2);

  const showGenerating = generating || !!generateError;

  async function handleGenerate() {
    setLastContext(context);
    await onGenerate(context);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-forest-950">AI Alışveriş Listesi</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={generating && !generateError}
            className="text-2xl leading-none text-gray-400 disabled:opacity-30"
            aria-label="Kapat"
          >
            ×
          </button>
        </div>

        {showGenerating ? (
          <AiListGeneratingScreen
            participantCount={readiness?.participantCount}
            error={generateError}
            onCancel={generateError ? onClose : undefined}
            onRetry={
              generateError && lastContext
                ? () => void onGenerate(lastContext)
                : undefined
            }
          />
        ) : (
          <>
        <div className="mb-4 flex gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full ${step >= n ? 'bg-blue-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        {loading && <p className="text-sm text-gray-500">Kontrol ediliyor...</p>}

        {!loading && step === 1 && readiness && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Liste, kayıtlı kişi sayısına göre hesaplanır. Kişi eklemeden liste oluşturulamaz.
            </p>

            <div className="rounded-xl border-2 border-blue-100 bg-blue-50 p-4">
              <p className="text-2xl font-bold text-blue-900">{readiness.participantCount} kişi</p>
              <p className="mt-1 text-sm text-blue-800">
                {readiness.adultCount} yetişkin · {readiness.childCount} çocuk ·{' '}
                {readiness.tentCount} çadır
              </p>
              {readiness.listBaselineHeadcount != null &&
                readiness.listBaselineHeadcount !== readiness.participantCount && (
                  <p className="mt-2 text-xs text-amber-800">
                    Önceki liste {readiness.listBaselineHeadcount} kişi için hesaplanmıştı — yeni
                    liste veya kişi eklenince miktarlar güncellenir.
                  </p>
                )}
            </div>

            {readiness.errors.length > 0 && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                <ul className="list-disc pl-4">
                  {readiness.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
                <Link href="/admin/kurulum" className="mt-2 inline-block font-semibold underline">
                  Kurulum sihirbazına git →
                </Link>
              </div>
            )}

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-gray-200 p-3">
              <input
                type="checkbox"
                checked={context.headcount_confirmed}
                onChange={(e) => update('headcount_confirmed', e.target.checked)}
                disabled={!readiness.ready}
                className="mt-1 h-5 w-5"
              />
              <span className="text-sm text-gray-800">
                <strong>Kişi listesi kesinleşti.</strong> Tüm katılımcılar kayıtlı ve çadırları
                atanmış; bu sayıya göre liste oluşturulsun.
              </span>
            </label>
          </div>
        )}

        {!loading && step === 2 && (
          <div className="space-y-4 text-sm">
            <p className="text-gray-600">
              Bu cevaplar AI&apos;nin kömürden tencereye kadar eksiksiz liste çıkarmasını sağlar.
            </p>

            <fieldset>
              <legend className="mb-1 font-semibold text-gray-800">Pişirme düzeni</legend>
              <div className="flex flex-col gap-2">
                {(
                  [
                    ['mangal', 'Mangal / barbekü'],
                    ['ocak', 'Kamp ocağı / tencere'],
                    ['both', 'İkisi de'],
                  ] as const
                ).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="cooking"
                      checked={context.cooking_setup === val}
                      onChange={() => update('cooking_setup', val)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={context.has_portable_cooler}
                onChange={(e) => update('has_portable_cooler', e.target.checked)}
              />
              Grupta taşınabilir kamp buzluğu / termos var
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={context.alcohol_in_menu}
                onChange={(e) => update('alcohol_in_menu', e.target.checked)}
              />
              Menüde alkol var
            </label>

            <div>
              <label className="mb-1 block font-semibold text-gray-800">Kahvaltı</label>
              <select
                value={context.breakfast_style}
                onChange={(e) =>
                  update('breakfast_style', e.target.value as ListGenerationContext['breakfast_style'])
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2"
              >
                <option value="full">Zengin kahvaltı</option>
                <option value="simple">Sade kahvaltı</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-gray-800">Çay / kahve</label>
              <select
                value={context.coffee_tea_level}
                onChange={(e) =>
                  update('coffee_tea_level', e.target.value as ListGenerationContext['coffee_tea_level'])
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2"
              >
                <option value="low">Az</option>
                <option value="medium">Orta</option>
                <option value="high">Çok</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-gray-800">Bulaşık</label>
              <select
                value={context.dishwashing}
                onChange={(e) =>
                  update('dishwashing', e.target.value as ListGenerationContext['dishwashing'])
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2"
              >
                <option value="camp_sink">Kamp lavabosunda</option>
                <option value="hand">Elde (kova ile)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-gray-800">
                Diyet / alerji / özel ihtiyaç
              </label>
              <textarea
                value={context.dietary_notes}
                onChange={(e) => update('dietary_notes', e.target.value)}
                placeholder="Örn: 1 vejetaryen, fıstık alerjisi yok..."
                rows={2}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-gray-800">Ek notlar</label>
              <textarea
                value={context.extra_notes}
                onChange={(e) => update('extra_notes', e.target.value)}
                placeholder="Örn: Cumartesi akşamı büyük mangal partisi..."
                rows={2}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2"
              />
            </div>
          </div>
        )}

        {!loading && step === 3 && readiness && (
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>{readiness.participantCount} kişi</strong> için eksiksiz ortak alışveriş listesi
              oluşturulacak.
            </p>
            <ul className="list-disc space-y-1 pl-4">
              <li>Menüdeki tüm yiyecek ve içecek malzemeleri</li>
              <li>Pişirme ekipmanı (mangal kömürü, tencere, ızgara teli vb.)</li>
              <li>Baharat, yağ, bulaşık malzemeleri</li>
              <li>Kişi eklenirse miktarlar otomatik güncellenir</li>
            </ul>
            <p className="text-xs text-gray-500">
              Hazır olunca otomatik olarak Kamp ihtiyaçları sayfasına yönlendirileceksiniz.
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="min-h-[48px] flex-1 rounded-xl border-2 border-gray-300 font-semibold"
            >
              Geri
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && !canProceedStep1}
              className="min-h-[48px] flex-1 rounded-xl bg-blue-600 font-semibold text-white disabled:opacity-50"
            >
              Devam
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleGenerate()}
              className="min-h-[48px] flex-1 rounded-xl bg-blue-600 font-semibold text-white"
            >
              Listeyi Oluştur
            </button>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
