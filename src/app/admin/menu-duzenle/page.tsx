'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AiClarificationModal from '@/components/admin/AiClarificationModal';
import CampDatesSummary from '@/components/admin/CampDatesSummary';
import ListGenerationWizard from '@/components/admin/ListGenerationWizard';
import CampSetupProgress from '@/components/admin/menu-setup/CampSetupProgress';
import CampSiteTypeStep from '@/components/admin/menu-setup/CampSiteTypeStep';
import HeadcountConfirmStep from '@/components/admin/menu-setup/HeadcountConfirmStep';
import SetupAssistantStep from '@/components/admin/menu-setup/SetupAssistantStep';
import WaterTeaStep from '@/components/admin/menu-setup/WaterTeaStep';
import ResetSetupButton from '@/components/admin/ResetSetupButton';
import { useDebouncedFn } from '@/hooks/use-debounced-fn';
import { useCampSetupProfile } from '@/hooks/use-camp-setup-profile';
import { getQuestionsForCampType, EXTRA_NOTES_QUESTION } from '@/lib/camp-setup-script';
import {
  type CampSetupProfile,
  type CampSiteType,
} from '@/lib/camp-setup-profile';
import type { ListGenerationContext } from '@/lib/list-generation-context';
import type { AiClarification } from '@/lib/openrouter';
import { SECTION_LABELS } from '@/lib/camp-slots';
import type { CampaignSettings } from '@/types';

interface DayCard {
  camp_day_number: number;
  date: string;
  title: string;
  is_arrival: boolean;
  is_departure: boolean;
  show_breakfast: boolean;
  show_meal: boolean;
  show_snack: boolean;
  breakfast: string;
  meal: string;
  snack: string;
}

type SectionKey = 'breakfast' | 'meal' | 'snack';

function countCampDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 3;
  return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

function assistantComplete(profile: CampSetupProfile): boolean {
  if (!profile.camp_site_type) return false;
  const qs = [...getQuestionsForCampType(profile.camp_site_type), EXTRA_NOTES_QUESTION];
  return qs.every((q) => Object.prototype.hasOwnProperty.call(profile.setup_answers, q.id));
}

export default function MenuDuzenlePage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Yükleniyor...</p>}>
      <MenuDuzenleContent />
    </Suspense>
  );
}

function MenuDuzenleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, loading: profileLoading, saving, error: profileError, patchProfile, resetProfile } =
    useCampSetupProfile();

  const [setupStep, setSetupStep] = useState(1);
  const [campaign, setCampaign] = useState<{
    name: string;
    location: string;
    start_date: string;
    end_date: string;
  } | null>(null);
  const [days, setDays] = useState<DayCard[]>([]);
  const [publishedDays, setPublishedDays] = useState<DayCard[] | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [apiSettings, setApiSettings] = useState<CampaignSettings | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [clarifications, setClarifications] = useState<AiClarification[]>([]);
  const [clarifyOpen, setClarifyOpen] = useState(false);
  const [pendingContext, setPendingContext] = useState<ListGenerationContext | null>(null);
  const [listReadiness, setListReadiness] = useState<{
    ready: boolean;
    participantCount: number;
    adultCount: number;
    childCount: number;
    tentCount: number;
    errors: string[];
    listBaselineHeadcount: number | null;
  } | null>(null);
  const [headcountReadiness, setHeadcountReadiness] = useState<{
    ready: boolean;
    participantCount: number;
    adultCount: number;
    childCount: number;
    tentCount: number;
    errors: string[];
    listBaselineHeadcount: number | null;
  } | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savingDay, setSavingDay] = useState<string | null>(null);
  const editingCount = useRef(0);
  const daysRef = useRef(days);
  daysRef.current = days;

  const campDays = campaign
    ? countCampDays(campaign.start_date, campaign.end_date)
    : 3;

  const eveningOptions = useMemo(
    () =>
      days
        .filter((d) => !d.is_departure)
        .map((d) => ({ date: d.date, title: d.title })),
    [days]
  );

  const debouncedWaterPatch = useDebouncedFn((patch: Partial<CampSetupProfile>) => {
    void patchProfile(patch);
  }, 600);

  useEffect(() => {
    const adim = Number(searchParams.get('adim'));
    if (adim >= 1 && adim <= 5) setSetupStep(adim);
  }, [searchParams]);

  const load = useCallback(async () => {
    const [campRes, daysRes, settingsRes] = await Promise.all([
      fetch('/api/campaign', { cache: 'no-store' }),
      fetch('/api/menus/day', { cache: 'no-store' }),
      fetch('/api/admin/settings'),
    ]);
    const campData = await campRes.json();
    const daysData = await daysRes.json();
    const settingsData = await settingsRes.json();

    if (campRes.ok && campData.campaign) {
      const c = campData.campaign;
      setCampaign({
        name: c.name,
        location: c.location,
        start_date: c.start_date,
        end_date: c.end_date,
      });
    }
    if (editingCount.current === 0) {
      setDays(daysData.days || []);
      setPublishedDays(daysData.published_days || null);
      setIsPublished(!!daysData.is_published);
    }
    if (settingsRes.ok) setApiSettings(settingsData);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadListReadiness = useCallback(async () => {
    const [headRes, listRes] = await Promise.all([
      fetch('/api/ai/list-readiness?scope=headcount'),
      fetch('/api/ai/list-readiness?scope=list'),
    ]);
    if (headRes.ok) setHeadcountReadiness(await headRes.json());
    if (listRes.ok) setListReadiness(await listRes.json());
  }, []);

  useEffect(() => {
    loadListReadiness();
  }, [loadListReadiness, days]);

  async function saveDay(card: DayCard, showFeedback = false) {
    if (showFeedback) setSavingDay(card.date);
    const res = await fetch('/api/menus/day', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day: card.date,
        camp_day_number: card.camp_day_number,
        is_arrival: card.is_arrival,
        is_departure: card.is_departure,
        breakfast: card.breakfast,
        meal: card.meal,
        snack: card.snack,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Kaydedilemedi');
    } else if (showFeedback) {
      setMessage(`${card.title} kaydedildi.`);
    }
    if (showFeedback) setSavingDay(null);
  }

  const debouncedSaveDay = useDebouncedFn((date: string) => {
    const card = daysRef.current.find((d) => d.date === date);
    if (card) void saveDay(card);
  }, 1000);

  function updateField(date: string, field: SectionKey, value: string) {
    setDays((prev) =>
      prev.map((d) => (d.date === date ? { ...d, [field]: value } : d))
    );
    debouncedSaveDay(date);
  }

  async function publishMenu() {
    setPublishing(true);
    setError('');
    setMessage('');
    const res = await fetch('/api/ai/publish-menu', { method: 'POST' });
    const data = await res.json();
    setPublishing(false);
    if (!res.ok) {
      setError(data.error || 'Menü yayınlanamadı');
      return;
    }
    setPublishedDays(data.days);
    setIsPublished(true);
    setMessage('Menü AI ile düzenlendi ve katılımcılara yayınlandı.');
  }

  async function runGenerate(
    context: ListGenerationContext,
    phase: 'preview' | 'finalize' = 'finalize',
    clarificationAnswers?: Record<string, string>
  ) {
    const res = await fetch('/api/ai/generate-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phase,
        context,
        clarification_answers: clarificationAnswers,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setGenerating(false);
      setGenerateError(data.error || 'Hata oluştu');
      return null;
    }
    return data;
  }

  async function generateList(context: ListGenerationContext) {
    setGenerating(true);
    setGenerateError('');
    setMessage('');
    setError('');
    setPendingContext(context);

    const preview = await runGenerate(context, 'preview');
    if (!preview) return;

    if (preview.clarifications?.length > 0) {
      setClarifications(preview.clarifications);
      setClarifyOpen(true);
      setGenerating(false);
      return;
    }

    const result = await runGenerate(context, 'finalize');
    if (!result) return;
    router.push(result.redirectTo || '/admin/listeler/kamp?generated=1');
  }

  async function handleClarificationSubmit(answers: Record<string, string>) {
    if (!pendingContext) return;
    setGenerating(true);
    const result = await runGenerate(pendingContext, 'finalize', answers);
    if (!result) return;
    setClarifyOpen(false);
    router.push(result.redirectTo || '/admin/listeler/kamp?generated=1');
  }

  function closeWizard() {
    setWizardOpen(false);
    setGenerating(false);
    setGenerateError('');
  }

  async function selectCampType(type: CampSiteType) {
    const ok = await patchProfile({
      camp_site_type: type,
      setup_answers: {},
      assistant_transcript: [],
    });
    if (ok) setSetupStep(2);
  }

  function canAdvanceFromStep(step: number): boolean {
    if (step === 1) return !!profile.camp_site_type;
    if (step === 2) return assistantComplete(profile);
    if (step === 3) {
      if (profile.water.tea_enabled && profile.water.tea_evening_dates.length === 0) {
        return eveningOptions.length === 0;
      }
      return true;
    }
    if (step === 4) return profile.headcount_confirmed;
    return true;
  }

  const hasMenuContent = days.some(
    (d) => d.breakfast.trim() || d.meal.trim() || d.snack.trim()
  );

  const sections: { key: SectionKey; show: keyof DayCard; label: string }[] = [
    { key: 'breakfast', show: 'show_breakfast', label: SECTION_LABELS.breakfast },
    { key: 'meal', show: 'show_meal', label: SECTION_LABELS.meal },
    { key: 'snack', show: 'show_snack', label: SECTION_LABELS.snack },
  ];

  const headcount = listReadiness?.participantCount || 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-forest-950 sm:text-2xl">
            Kamp kurulum ve menü
          </h2>
          <p className="mt-1 text-sm text-forest-600">
            Kurulumu tamamlayın, menüleri yazın, AI ile yayınlayın ve liste oluşturun.
          </p>
        </div>
        <ResetSetupButton onReset={resetProfile} disabled={profileLoading || saving} />
      </div>

      {campaign && (
        <CampDatesSummary
          name={campaign.name}
          location={campaign.location}
          startDate={campaign.start_date}
          endDate={campaign.end_date}
        />
      )}

      {(error || profileError) && (
        <p className="rounded-lg bg-red-100 p-3 text-base text-red-700">{error || profileError}</p>
      )}
      {message && (
        <p className="rounded-lg bg-blue-100 p-3 text-base text-blue-800">{message}</p>
      )}

      {profile.legacy_menu_prompt && !profile.extra_notes && (
        <p className="rounded-lg bg-purple-50 px-3 py-2 text-sm text-purple-900">
          Eski AI talimatınız kurulum profiline taşındı.
        </p>
      )}

      <section className="rounded-xl border-2 border-emerald-100 bg-white p-4">
        <CampSetupProgress
          profile={profile}
          currentStep={setupStep}
          onStepClick={(s) => s <= setupStep && setSetupStep(s)}
        />

        {profileLoading ? (
          <p className="mt-4 text-sm text-gray-500">Kurulum yükleniyor...</p>
        ) : (
          <div className="mt-4">
            {setupStep === 1 && (
              <CampSiteTypeStep
                profile={profile}
                onSelect={selectCampType}
                saving={saving}
              />
            )}
            {setupStep === 2 && (
              <SetupAssistantStep
                profile={profile}
                onAnswer={patchProfile}
                saving={saving}
              />
            )}
            {setupStep === 3 && (
              <WaterTeaStep
                profile={profile}
                headcount={Math.max(headcount, 1)}
                campDays={campDays}
                evenings={eveningOptions}
                onPatch={(patch) => debouncedWaterPatch(patch)}
              />
            )}
            {setupStep === 4 && (
              <HeadcountConfirmStep
                profile={profile}
                readiness={headcountReadiness}
                loading={!headcountReadiness}
                onConfirm={(confirmed) => void patchProfile({ headcount_confirmed: confirmed })}
              />
            )}
          </div>
        )}

        {setupStep < 5 && !profileLoading && (
          <div className="mt-6 flex gap-2">
            {setupStep > 1 && (
              <button
                type="button"
                onClick={() => setSetupStep((s) => s - 1)}
                className="min-h-[48px] flex-1 rounded-xl border-2 border-gray-300 font-semibold"
              >
                Geri
              </button>
            )}
            <button
              type="button"
              disabled={!canAdvanceFromStep(setupStep) || saving}
              onClick={() => setSetupStep((s) => s + 1)}
              className="min-h-[48px] flex-1 rounded-xl bg-emerald-600 font-semibold text-white disabled:opacity-50"
            >
              {setupStep === 4 ? 'Menülere geç' : 'Devam'}
            </button>
          </div>
        )}
      </section>

      {setupStep === 5 && (
        <>
          <div>
            <h3 className="mb-2 text-lg font-semibold">Ham Menü Notları</h3>
            <p className="mb-3 text-sm text-gray-500">
              Yazmayı bıraktıktan ~1 sn sonra otomatik kaydedilir.
            </p>
            {days.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Menü günleri için önce kamp tarihlerini belirleyin.{' '}
                <Link href="/admin/kamp" className="font-semibold underline">
                  Kamp bilgileri →
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {days.map((card) => (
                  <section
                    key={card.date}
                    className={`rounded-xl border-2 p-4 ${
                      card.is_departure
                        ? 'border-amber-300 bg-amber-50'
                        : card.is_arrival
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-white'
                    }`}
                  >
                    <h4 className="text-lg font-semibold text-emerald-900">{card.title}</h4>
                    <div className="mt-4 flex flex-col gap-4">
                      {sections.map(({ key, show, label }) =>
                        card[show] ? (
                          <div key={key}>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">
                              {label}
                            </label>
                            <textarea
                              value={card[key]}
                              onChange={(e) => updateField(card.date, key, e.target.value)}
                              onFocus={() => {
                                editingCount.current += 1;
                              }}
                              onBlur={() => {
                                editingCount.current = Math.max(0, editingCount.current - 1);
                              }}
                              placeholder={`${label} notları...`}
                              rows={3}
                              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        ) : null
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => saveDay(card, true)}
                      disabled={savingDay === card.date}
                      className="mt-4 min-h-[44px] w-full rounded-lg bg-emerald-600 text-base font-semibold text-white disabled:opacity-50"
                    >
                      {savingDay === card.date ? 'Kaydediliyor...' : 'Bu Günü Kaydet'}
                    </button>
                  </section>
                ))}
              </div>
            )}
          </div>

          {!apiSettings?.configured && (
            <div className="rounded-xl bg-amber-100 p-4 text-lg text-amber-900">
              {apiSettings?.is_pro ? (
                <>AI şu an geçici olarak kullanılamıyor. Bir süre sonra tekrar deneyin.</>
              ) : (
                <>
                  AI menü ve liste özelliği Pro sürümde dahildir.{' '}
                  <Link href="/admin/pro" className="font-semibold underline">
                    Pro sayfasından
                  </Link>{' '}
                  bize yazın.
                </>
              )}
            </div>
          )}

          <button
            onClick={publishMenu}
            disabled={publishing || !hasMenuContent || !apiSettings?.configured}
            className="min-h-[52px] w-full rounded-xl bg-purple-600 text-base font-semibold text-white disabled:opacity-50 sm:text-lg"
          >
            {publishing ? 'AI Menüyü Düzenliyor...' : 'Menüyü AI ile Düzenle ve Yayınla'}
          </button>

          {isPublished && publishedDays && (
            <div>
              <h3 className="mb-2 text-lg font-semibold text-emerald-800">
                Yayınlanan Menü (katılımcıların gördüğü)
              </h3>
              <div className="grid gap-4 lg:grid-cols-2">
                {publishedDays.map((card) => (
                  <section
                    key={card.date}
                    className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4"
                  >
                    <h4 className="font-semibold text-emerald-900">{card.title}</h4>
                    <div className="mt-2 space-y-2 text-base text-gray-800">
                      {card.show_breakfast && card.breakfast.trim() && (
                        <p>
                          <strong>Kahvaltı:</strong> {card.breakfast}
                        </p>
                      )}
                      {card.show_meal && card.meal.trim() && (
                        <p>
                          <strong>Yemek:</strong> {card.meal}
                        </p>
                      )}
                      {card.show_snack && card.snack.trim() && (
                        <p>
                          <strong>Ara Öğün:</strong> {card.snack}
                        </p>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setWizardOpen(true)}
            disabled={
              generating ||
              !hasMenuContent ||
              !apiSettings?.configured ||
              !profile.headcount_confirmed
            }
            className="min-h-[52px] w-full rounded-xl bg-blue-600 text-base font-semibold text-white disabled:opacity-50 sm:text-lg"
          >
            {generating ? 'AI Listesi Oluşturuluyor...' : 'Alışveriş Listesini Oluştur (AI)'}
          </button>

          {!profile.headcount_confirmed && (
            <button
              type="button"
              onClick={() => setSetupStep(4)}
              className="min-h-[44px] w-full rounded-xl border-2 border-amber-300 bg-amber-50 text-sm font-semibold text-amber-900"
            >
              Kişi listesini onaylamak için 4. adıma git →
            </button>
          )}

          {listReadiness?.ready && profile.headcount_confirmed && (
            <p className="text-sm text-gray-600">
              {listReadiness.participantCount} kişi kayıtlı — liste bu sayıya göre hesaplanır.
            </p>
          )}
        </>
      )}

      {setupStep < 4 && !profileLoading && (
        <p className="text-center text-xs text-gray-500">
          Adım {setupStep}/5 — kurulumu tamamlayınca menü adımına geçeceksiniz.
        </p>
      )}

      <ListGenerationWizard
        open={wizardOpen}
        onClose={closeWizard}
        onGenerate={generateList}
        generating={generating}
        generateError={generateError}
        profile={profile}
        onPatchProfile={patchProfile}
      />

      <AiClarificationModal
        open={clarifyOpen}
        clarifications={clarifications}
        onClose={() => {
          setClarifyOpen(false);
          setGenerating(false);
        }}
        onSubmit={handleClarificationSubmit}
        loading={generating}
      />
    </div>
  );
}
