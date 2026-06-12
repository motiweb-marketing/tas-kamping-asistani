import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';

export default function Step4MenuGuide() {
  return (
    <div className="space-y-5">
      <Link href="/admin/menu-duzenle">
        <AuthButton type="button" className="w-full sm:w-auto">
          Menüyü düzenle →
        </AuthButton>
      </Link>
      <p className="text-xs text-forest-500">
        Menü sayfasında günlük kartları doldurun; değişiklikler otomatik kaydedilir.
      </p>
    </div>
  );
}
