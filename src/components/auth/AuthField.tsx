import type { InputHTMLAttributes } from 'react';

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export default function AuthField({ label, hint, className = '', id, ...props }: AuthFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-semibold text-forest-900">
        {label}
      </label>
      <input
        id={fieldId}
        className={`w-full rounded-xl border border-forest-200 bg-white px-4 py-3 text-base text-forest-950 shadow-sm transition-all placeholder:text-forest-300 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20 disabled:bg-forest-50 disabled:opacity-60 ${className}`}
        {...props}
      />
      {hint && <p className="text-xs text-forest-500">{hint}</p>}
    </div>
  );
}
