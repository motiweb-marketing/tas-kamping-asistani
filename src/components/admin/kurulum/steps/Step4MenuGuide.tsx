import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';

export default function Step4MenuGuide() {
  return (
    <div className="space-y-5">
      <p className="text-sm text-forest-600">
        Her gün için kahvaltı, ana öğün ve ara öğün yazın. Menüyü kaydettikten sonra bir sonraki adımda
        alışveriş listesini oluşturabilirsiniz.
      </p>
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
