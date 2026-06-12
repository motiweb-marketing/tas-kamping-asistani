import AdminPageHeader from '@/components/admin/AdminPageHeader';
import TentsManager from '@/components/admin/TentsManager';

export default function CadirlarPage() {
  return (
    <div>
      <AdminPageHeader
        title="Çadırlar ve kişiler"
        description="Çadırları ve katılımcıları ekleyin veya düzenleyin."
      />
      <TentsManager />
    </div>
  );
}
