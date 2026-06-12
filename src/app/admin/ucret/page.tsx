import AdminPageHeader from '@/components/admin/AdminPageHeader';
import Step3Ucret from '@/components/admin/kurulum/steps/Step3Ucret';

export default function UcretPage() {
  return (
    <div>
      <AdminPageHeader
        title="Konaklama ücreti"
        description="Tesis kişi başı ücretini belirleyin. Bakiye hesabında kullanılır."
      />
      <div className="rounded-2xl border border-forest-100 bg-white p-6 shadow-sm">
        <Step3Ucret />
      </div>
    </div>
  );
}
