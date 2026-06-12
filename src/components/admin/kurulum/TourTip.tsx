import type { TourStepTip } from '@/lib/admin-tour';

interface TourTipProps {
  tip: TourStepTip;
  variant?: 'default' | 'highlight';
}

export default function TourTip({ tip, variant = 'default' }: TourTipProps) {
  const isHighlight = variant === 'highlight';

  return (
    <div
      className={`relative mb-6 rounded-2xl border-2 p-4 sm:p-5 ${
        isHighlight
          ? 'border-forest-400 bg-gradient-to-br from-forest-50 to-sand-50'
          : 'border-blue-200 bg-blue-50'
      }`}
    >
      <div
        className={`absolute -top-2.5 left-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
          isHighlight ? 'bg-forest-800 text-white' : 'bg-blue-600 text-white'
        }`}
      >
        {isHighlight ? 'Önemli' : 'Bilgi'}
      </div>
      <h3
        className={`mt-1 font-display text-base font-bold ${
          isHighlight ? 'text-forest-950' : 'text-blue-950'
        }`}
      >
        {tip.title}
      </h3>
      <p className={`mt-2 text-sm leading-relaxed ${isHighlight ? 'text-forest-800' : 'text-blue-900'}`}>
        {tip.body}
      </p>
      {tip.bullets && tip.bullets.length > 0 && (
        <ul className={`mt-3 space-y-1.5 text-sm ${isHighlight ? 'text-forest-700' : 'text-blue-800'}`}>
          {tip.bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
