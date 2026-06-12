import AdminPageHeader from '@/components/admin/AdminPageHeader';
import Step6Paylas from '@/components/admin/kurulum/steps/Step6Paylas';

export default function PaylasPage() {
  return (
    <div>
      <AdminPageHeader
        title="Giriş bilgisini paylaş"
        description="Katılımcılara giriş adresi ve kullanıcı adlarını gönderin."
      />
      <div className="rounded-2xl border border-forest-100 bg-white p-6 shadow-sm">
        <Step6Paylas />
      </div>
    </div>
  );
}
