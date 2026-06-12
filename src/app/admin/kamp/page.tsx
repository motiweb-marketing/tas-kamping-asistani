import AdminPageHeader from '@/components/admin/AdminPageHeader';
import Step1Kamp from '@/components/admin/kurulum/steps/Step1Kamp';

export default function KampPage() {
  return (
    <div>
      <AdminPageHeader
        title="Kamp bilgileri"
        description="Kamp adı, konum ve tarihleri buradan düzenleyebilirsiniz."
      />
      <div className="rounded-2xl border border-forest-100 bg-white p-6 shadow-sm">
        <Step1Kamp />
      </div>
    </div>
  );
}
