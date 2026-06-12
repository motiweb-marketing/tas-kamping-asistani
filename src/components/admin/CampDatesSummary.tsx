import Link from 'next/link';
import { Calendar } from 'lucide-react';

interface CampDatesSummaryProps {
  name?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
}

export default function CampDatesSummary({
  name,
  location,
  startDate,
  endDate,
}: CampDatesSummaryProps) {
  const hasDates = Boolean(startDate && endDate);

  return (
    <div className="flex gap-3 rounded-xl border border-forest-200 bg-gradient-to-r from-forest-50 to-white px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-800 text-white">
        <Calendar className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 text-sm text-forest-700">
        {name && <p className="font-semibold text-forest-950">{name}</p>}
        {location && name && (
          <p className="text-xs text-forest-500">{location}</p>
        )}
        {hasDates ? (
          <p className="mt-1">
            <span className="font-medium text-forest-900">
              {startDate} — {endDate}
            </span>
            {' · '}
            <Link href="/admin/kamp" className="font-semibold text-emerald-700 underline hover:text-emerald-900">
              Tarihleri düzenle
            </Link>
          </p>
        ) : (
          <p className="mt-1">
            Kamp tarihleri henüz girilmemiş.{' '}
            <Link href="/admin/kamp" className="font-semibold text-emerald-700 underline hover:text-emerald-900">
              Önce varış ve ayrılış tarihini seçin
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
