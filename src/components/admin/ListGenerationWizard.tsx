'use client';

import { useEffect, useState } from 'react';
import AiListGeneratingScreen from '@/components/admin/AiListGeneratingScreen';
import { profileToListContext, type CampSetupProfile } from '@/lib/camp-setup-profile';
import type { ListGenerationContext } from '@/lib/list-generation-context';

interface Readiness {
  ready: boolean;
  errors: string[];
  participantCount: number;
  adultCount: number;
  childCount: number;
  tentCount: number;
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
  profile: CampSetupProfile;
  onPatchProfile: (patch: Partial<CampSetupProfile>) => Promise<boolean>;
}

export default function ListGenerationWizard({
  open,
  onClose,
  onGenerate,
  generating,
  generateError = '',
  profile,
  onPatchProfile,
}: Props) {
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastContext, setLastContext] = useState<ListGenerationContext | null>(null);
  const [localProfile, setLocalProfile] = useState(profile);

  useEffect(() => {
    if (!open) return;
    setLocalProfile(profile);
    setLoading(true);
    fetch('/api/ai/list-readiness')
      .then((r) => r.json())
      .then((data) => setReadiness(data))
      .finally(() => setLoading(false));
  }, [open, profile]);

  if (!open) return null;

  const context = profileToListContext(localProfile);
  const showGenerating = generating || !!generateError;

  async function handleGenerate() {
    await onPatchProfile({
      cooking_setup: localProfile.cooking_setup,
      has_portable_cooler: localProfile.has_portable_cooler,
      dietary_notes: localProfile.dietary_notes,
      alcohol_in_menu: localProfile.alcohol_in_menu,
      breakfast_style: localProfile.breakfast_style,
      dishwashing: localProfile.dishwashing,
      extra_notes: localProfile.extra_notes,
      headcount_confirmed: localProfile.headcount_confirmed,
    });
    setLastContext(context);
    await onGenerate(context);
  }

  function updateProfile<K extends keyof CampSetupProfile>(key: K, value: CampSetupProfile[K]) {
    setLocalProfile((prev) => ({ ...prev, [key]: value }));
    void onPatchProfile({ [key]: value } as Partial<CampSetupProfile>);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-forest-950">Alışveriş listesi</h3>
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
          <div className="space-y-4 text-sm">
            {loading && <p className="text-gray-500">Kontrol ediliyor...</p>}

            {!loading && readiness && (
              <>
                <p>
                  <strong>{readiness.participantCount} kişi</strong> için eksiksiz ortak alışveriş
                  listesi oluşturulacak. Su miktarları kurulum profilinden otomatik eklenir.
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
                          checked={localProfile.cooking_setup === val}
                          onChange={() => updateProfile('cooking_setup', val)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localProfile.has_portable_cooler}
                    onChange={(e) => updateProfile('has_portable_cooler', e.target.checked)}
                  />
                  Grupta taşınabilir kamp buzluğu / termos var
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localProfile.alcohol_in_menu}
                    onChange={(e) => updateProfile('alcohol_in_menu', e.target.checked)}
                  />
                  Menüde alkol var
                </label>

                <div>
                  <label className="mb-1 block font-semibold text-gray-800">Kahvaltı</label>
                  <select
                    value={localProfile.breakfast_style}
                    onChange={(e) =>
                      updateProfile(
                        'breakfast_style',
                        e.target.value as CampSetupProfile['breakfast_style']
                      )
                    }
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-2"
                  >
                    <option value="full">Zengin kahvaltı</option>
                    <option value="simple">Sade kahvaltı</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-gray-800">Bulaşık</label>
                  <select
                    value={localProfile.dishwashing}
                    onChange={(e) =>
                      updateProfile(
                        'dishwashing',
                        e.target.value as CampSetupProfile['dishwashing']
                      )
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
                    value={localProfile.dietary_notes}
                    onChange={(e) => updateProfile('dietary_notes', e.target.value)}
                    placeholder="Örn: 1 vejetaryen..."
                    rows={2}
                    className="w-full rounded-lg border-2 border-gray-200 px-3 py-2"
                  />
                </div>

                <ul className="list-disc space-y-1 pl-4 text-gray-600">
                  <li>Menüdeki tüm yiyecek ve içecek malzemeleri</li>
                  <li>Pişirme ekipmanı ve bulaşık malzemeleri</li>
                  <li>İçme suyu ve çay suyu (kurulumdan)</li>
                </ul>
              </>
            )}

            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={loading || !readiness?.ready || !localProfile.headcount_confirmed}
              className="min-h-[48px] w-full rounded-xl bg-blue-600 font-semibold text-white disabled:opacity-50"
            >
              Listeyi Oluştur
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
