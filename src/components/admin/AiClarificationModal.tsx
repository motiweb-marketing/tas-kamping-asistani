'use client';

import { useEffect, useState } from 'react';
import type { AiClarification } from '@/lib/openrouter';

const DEFAULT_OPTION = 'Bilmiyorum / Varsayılan';

interface Props {
  open: boolean;
  clarifications: AiClarification[];
  onClose: () => void;
  onSubmit: (answers: Record<string, string>) => void;
  loading?: boolean;
}

export default function AiClarificationModal({
  open,
  clarifications,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) setAnswers({});
  }, [open, clarifications]);

  if (!open || clarifications.length === 0) return null;

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  const allAnswered = clarifications.every((c) => answers[c.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
      >
        <h3 className="text-lg font-bold text-forest-950">Birkaç netleştirme</h3>
        <p className="mt-1 text-sm text-gray-600">
          AI listeniz için birkaç kısa soru sordu. Çoğu kamp için bu adım atlanır.
        </p>

        <div className="mt-4 space-y-5">
          {clarifications.map((c) => (
            <fieldset key={c.id}>
              <legend className="mb-2 text-sm font-semibold text-gray-800">{c.question}</legend>
              <div className="flex flex-col gap-2">
                {(c.options || []).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAnswer(c.id, opt)}
                    className={`min-h-[48px] rounded-xl border-2 px-4 text-left text-sm font-semibold ${
                      answers[c.id] === opt
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAnswer(c.id, DEFAULT_OPTION)}
                  className={`min-h-[48px] rounded-xl border-2 px-4 text-left text-sm ${
                    answers[c.id] === DEFAULT_OPTION
                      ? 'border-gray-600 bg-gray-100'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {DEFAULT_OPTION}
                </button>
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-[48px] flex-1 rounded-xl border-2 border-gray-300 font-semibold disabled:opacity-50"
          >
            İptal
          </button>
          <button
            type="button"
            disabled={!allAnswered || loading}
            onClick={() => onSubmit(answers)}
            className="min-h-[48px] flex-1 rounded-xl bg-blue-600 font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Oluşturuluyor...' : 'Listeyi oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
}
