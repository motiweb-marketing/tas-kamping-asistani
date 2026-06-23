'use client';

import { useMemo, useState } from 'react';
import CoachBubble from '@/components/onboarding/CoachBubble';
import {
  EXTRA_NOTES_QUESTION,
  getQuestionsForCampType,
} from '@/lib/camp-setup-script';
import type { AssistantTranscriptEntry, CampSetupProfile } from '@/lib/camp-setup-profile';

interface Props {
  profile: CampSetupProfile;
  onAnswer: (patch: Partial<CampSetupProfile>) => Promise<boolean>;
  saving?: boolean;
}

export default function SetupAssistantStep({ profile, onAnswer, saving }: Props) {
  const questions = useMemo(
    () => [...getQuestionsForCampType(profile.camp_site_type), EXTRA_NOTES_QUESTION],
    [profile.camp_site_type]
  );

  const answeredIds = new Set(Object.keys(profile.setup_answers));
  const currentIndex = questions.findIndex((q) => !answeredIds.has(q.id));
  const current = currentIndex >= 0 ? questions[currentIndex] : null;
  const [extraText, setExtraText] = useState(
    String(profile.setup_answers.extra_notes || profile.extra_notes || '')
  );

  async function answerYesNo(id: string, value: boolean, questionText: string) {
    const entries: AssistantTranscriptEntry[] = [
      ...profile.assistant_transcript,
      { role: 'assistant', text: questionText, step_id: id },
      { role: 'user', text: value ? 'Evet' : 'Hayır', step_id: id },
    ];
    await onAnswer({
      setup_answers: { [id]: value },
      assistant_transcript: entries,
    });
  }

  async function saveExtraNotes() {
    const trimmed = extraText.trim();
    const entries: AssistantTranscriptEntry[] = [
      ...profile.assistant_transcript,
      { role: 'assistant', text: EXTRA_NOTES_QUESTION.text, step_id: 'extra_notes' },
      { role: 'user', text: trimmed || '(not yok)', step_id: 'extra_notes' },
    ];
    await onAnswer({
      setup_answers: { extra_notes: trimmed },
      extra_notes: trimmed,
      assistant_transcript: entries,
    });
  }

  if (!profile.camp_site_type) {
    return (
      <p className="text-sm text-amber-800">Önce kamp tipini seçin.</p>
    );
  }

  return (
    <div className="space-y-4">
      {profile.assistant_transcript.map((entry, i) => (
        <div
          key={`${entry.step_id}-${i}`}
          className={`rounded-xl px-3 py-2 text-sm ${
            entry.role === 'assistant'
              ? 'bg-forest-50 text-forest-800'
              : 'ml-8 bg-emerald-100 text-emerald-900'
          }`}
        >
          {entry.text}
        </div>
      ))}

      {current?.type === 'yes_no' && (
        <CoachBubble
          title="Kamp asistanı"
          body={current.text}
          cta="Evet"
          onNext={() => current && void answerYesNo(current.id, true, current.text)}
          onSkip={() => current && void answerYesNo(current.id, false, current.text)}
          skipLabel="Hayır"
        />
      )}

      {current?.type === 'text' && (
        <div className="space-y-3">
          <CoachBubble title="Kamp asistanı" body={current.text} />
          <textarea
            value={extraText}
            onChange={(e) => setExtraText(e.target.value)}
            placeholder="İsteğe bağlı not..."
            rows={3}
            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-base"
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveExtraNotes()}
            className="min-h-[48px] w-full rounded-xl bg-emerald-600 font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : extraText.trim() ? 'Kaydet ve devam' : 'Atla'}
          </button>
        </div>
      )}

      {!current && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          Asistan soruları tamamlandı. Devam edebilirsiniz.
        </p>
      )}
    </div>
  );
}
