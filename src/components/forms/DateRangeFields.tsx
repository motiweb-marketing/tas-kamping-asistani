'use client';

import AuthField from '@/components/auth/AuthField';
import { coerceDateRangeOnStartChange } from '@/lib/date-range';

interface DateRangeFieldsProps {
  startDate: string;
  endDate: string;
  onChange: (values: { start_date: string; end_date: string }) => void;
  startLabel?: string;
  endLabel?: string;
  startHint?: string;
  endHint?: string;
  required?: boolean;
  className?: string;
  /** Varış için en erken tarih (ör. bugün) */
  startMin?: string;
}

export default function DateRangeFields({
  startDate,
  endDate,
  onChange,
  startLabel = 'Varış tarihi',
  endLabel = 'Ayrılış tarihi',
  startHint = 'İlk akşam yemeği — önce bunu seçin',
  endHint = 'Son kahvaltı',
  required,
  className = '',
  startMin,
}: DateRangeFieldsProps) {
  const endDisabled = !startDate;
  const resolvedEndHint = endDisabled ? 'Önce varış tarihini seçin' : endHint;

  function handleStartChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(coerceDateRangeOnStartChange(e.target.value, endDate));
  }

  function handleEndChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ start_date: startDate, end_date: e.target.value });
  }

  return (
    <div className={`grid gap-5 sm:grid-cols-2 ${className}`}>
      <AuthField
        label={startLabel}
        type="date"
        value={startDate}
        onChange={handleStartChange}
        hint={startHint}
        min={startMin}
        required={required}
        autoComplete="off"
      />
      <AuthField
        label={endLabel}
        type="date"
        value={endDate}
        onChange={handleEndChange}
        hint={resolvedEndHint}
        min={startDate || undefined}
        disabled={endDisabled}
        required={required}
        autoComplete="off"
        aria-disabled={endDisabled}
      />
    </div>
  );
}
