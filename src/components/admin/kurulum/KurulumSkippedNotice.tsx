import Link from 'next/link';
import { SETUP_STEPS, type SetupProgressInput, getStepCompletion } from '@/lib/admin-setup';

interface KurulumSkippedNoticeProps {
  currentStep: number;
  progress: SetupProgressInput;
}

const SKIP_REASONS: Record<number, string> = {
  1: 'Kamp adı ve tarihler kayıt ekranında girildi',
  2: 'Organizatör çadırı ve hesabı kayıt sırasında oluşturuldu',
  3: 'Konaklama ücreti isteğe bağlı — isterseniz sonra ayarlayabilirsiniz',
};

export default function KurulumSkippedNotice({ currentStep, progress }: KurulumSkippedNoticeProps) {
  const completed = getStepCompletion(progress);
  const skipped = SETUP_STEPS.filter((s) => s.id < currentStep && completed[s.id]);

  if (skipped.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
      <p className="font-semibold">Önceki adımlar tamam — buradan devam ediyorsunuz</p>
      <ul className="mt-2 space-y-1 text-blue-800">
        {skipped.map((step) => (
          <li key={step.id} className="flex flex-wrap items-baseline gap-x-2">
            <span>✓ {step.title}</span>
            <span className="text-xs text-blue-600">
              {SKIP_REASONS[step.id] || 'Tamamlandı'}
            </span>
            <Link href={step.editHref} className="text-xs font-semibold underline">
              Düzenle
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-blue-700">
        İstediğiniz zaman sol menüden veya yukarıdaki adım numaralarına tıklayarak geri dönebilirsiniz.
      </p>
    </div>
  );
}
