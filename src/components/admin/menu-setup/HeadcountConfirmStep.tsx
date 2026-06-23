'use client';

import Link from 'next/link';
import type { CampSetupProfile } from '@/lib/camp-setup-profile';

interface Readiness {
  ready: boolean;
  errors: string[];
  participantCount: number;
  adultCount: number;
  childCount: number;
  tentCount: number;
  listBaselineHeadcount: number | null;
}

interface Props {
  profile: CampSetupProfile;
  readiness: Readiness | null;
  loading?: boolean;
  onConfirm: (confirmed: boolean) => void;
}

export default function HeadcountConfirmStep({
  profile,
  readiness,
  loading,
  onConfirm,
}: Props) {
  if (loading) {
    return <p className="text-sm text-gray-500">Kişi listesi kontrol ediliyor...</p>;
  }

  if (!readiness) {
    return <p className="text-sm text-red-700">Kişi bilgisi yüklenemedi.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Liste, kayıtlı kişi sayısına göre hesaplanır. Manuel sayı girişi yok — sadece onay.
      </p>

      <div className="rounded-xl border-2 border-blue-100 bg-blue-50 p-4">
        <p className="text-2xl font-bold text-blue-900">{readiness.participantCount} kişi</p>
        <p className="mt-1 text-sm text-blue-800">
          {readiness.adultCount} yetişkin · {readiness.childCount} çocuk · {readiness.tentCount}{' '}
          çadır
        </p>
        {readiness.listBaselineHeadcount != null &&
          readiness.listBaselineHeadcount !== readiness.participantCount && (
            <p className="mt-2 text-xs text-amber-800">
              Önceki liste {readiness.listBaselineHeadcount} kişi için hesaplanmıştı.
            </p>
          )}
      </div>

      {readiness.errors.length > 0 && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          <ul className="list-disc pl-4">
            {readiness.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <Link href="/admin/kurulum" className="mt-2 inline-block font-semibold underline">
            Kurulum sihirbazına git →
          </Link>
        </div>
      )}

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-gray-200 p-3">
        <input
          type="checkbox"
          checked={profile.headcount_confirmed}
          onChange={(e) => onConfirm(e.target.checked)}
          disabled={!readiness.ready}
          className="mt-1 h-5 w-5"
        />
        <span className="text-sm text-gray-800">
          <strong>Kişi listesi kesinleşti.</strong> Tüm katılımcılar kayıtlı ve çadırları atanmış;
          bu sayıya göre menü ve liste oluşturulsun.
        </span>
      </label>
    </div>
  );
}
