interface StepIndicatorProps {
  steps: string[];
  current: number;
}

export default function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2">
        {steps.map((label, i) => {
          const stepNum = i + 1;
          const active = stepNum === current;
          const done = stepNum < current;
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  done
                    ? 'bg-forest-800 text-white'
                    : active
                      ? 'bg-forest-800 text-white ring-4 ring-forest-200'
                      : 'bg-forest-100 text-forest-400'
                }`}
              >
                {done ? '✓' : stepNum}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 rounded ${done ? 'bg-forest-600' : 'bg-forest-100'}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm font-semibold text-forest-800">{steps[current - 1]}</p>
    </div>
  );
}
