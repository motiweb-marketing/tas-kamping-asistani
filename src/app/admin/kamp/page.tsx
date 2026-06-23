'use client';

import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ResetSetupButton from '@/components/admin/ResetSetupButton';
import Step1Kamp from '@/components/admin/kurulum/steps/Step1Kamp';
import { useCampSetupProfile } from '@/hooks/use-camp-setup-profile';

function KampResetSection() {
  const { resetProfile, loading, saving } = useCampSetupProfile();
  return (
    <div className="mt-6 border-t border-forest-100 pt-6">
      <h3 className="mb-2 text-base font-semibold text-forest-900">Kurulum profili</h3>
      <p className="mb-3 text-sm text-forest-600">
        Menü kurulumundaki kamp tipi, asistan cevapları ve su planını sıfırlar. Menü günleri
        kalır.
      </p>
      <ResetSetupButton onReset={resetProfile} disabled={loading || saving} />
    </div>
  );
}

export default function KampPage() {
  return (
    <div>
      <AdminPageHeader
        title="Kamp bilgileri"
        description="Kamp adı, konum ve tarihleri buradan düzenleyebilirsiniz."
      />
      <div className="rounded-2xl border border-forest-100 bg-white p-6 shadow-sm">
        <Step1Kamp />
        <KampResetSection />
      </div>
    </div>
  );
}
