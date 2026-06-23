'use client';

interface Props {
  title: string;
  body: string;
  cta?: string;
  onNext?: () => void;
  onSkip?: () => void;
  skipLabel?: string;
  className?: string;
}

export default function CoachBubble({
  title,
  body,
  cta = 'Devam',
  onNext,
  onSkip,
  skipLabel = 'Atla',
  className = '',
}: Props) {
  return (
    <div
      className={`relative rounded-2xl border-2 border-forest-200 bg-white p-4 shadow-lg ${className}`}
      role="status"
    >
      <div
        className="absolute -top-2 left-6 h-4 w-4 rotate-45 border-l-2 border-t-2 border-forest-200 bg-white"
        aria-hidden
      />
      <p className="text-xs font-bold uppercase tracking-wide text-forest-500">Kamp lideri</p>
      <h3 className="mt-1 font-display text-base font-bold text-forest-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-forest-700">{body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="min-h-[44px] rounded-xl bg-forest-800 px-4 text-sm font-semibold text-white"
          >
            {cta}
          </button>
        )}
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="min-h-[44px] rounded-xl px-3 text-sm font-semibold text-forest-500"
          >
            {skipLabel}
          </button>
        )}
      </div>
    </div>
  );
}
