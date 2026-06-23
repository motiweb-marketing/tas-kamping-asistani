interface StepFrameProps {
  title: string;
  description: string;
  bullets?: string[];
  highlight?: boolean;
  children: React.ReactNode;
}

export default function StepFrame({
  title,
  description,
  bullets,
  highlight = false,
  children,
}: StepFrameProps) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm sm:p-8 ${
        highlight
          ? 'border-forest-300 bg-gradient-to-br from-forest-50 to-white'
          : 'border-forest-100 bg-white'
      }`}
    >
      <header className="mb-5 border-b border-forest-100 pb-4 sm:mb-6">
        {highlight && (
          <span className="mb-2 inline-block rounded-full bg-forest-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Önemli
          </span>
        )}
        <h2 className="font-display text-lg font-bold text-forest-950 sm:text-xl">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-forest-600">{description}</p>
        ) : null}
        {bullets && bullets.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm text-forest-700">
            {bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="shrink-0 text-forest-500">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </header>
      {children}
    </div>
  );
}
