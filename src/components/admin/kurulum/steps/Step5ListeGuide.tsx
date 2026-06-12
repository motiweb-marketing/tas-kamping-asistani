import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';

export default function Step5ListeGuide() {
  return (
    <div className="space-y-5">
      <ol className="list-decimal space-y-2 pl-5 text-sm text-forest-700">
        <li>Menü sayfasında <strong>AI ile alışveriş listesi oluştur</strong> (veya elle ekleyin)</li>
        <li>Alışveriş listesinde taslakları kontrol edin</li>
        <li><strong>Yayınla</strong> — katılımcılar ortak listeyi görür</li>
        <li>İsteğe bağlı: hazır kişisel/çadır listelerini ekleyin</li>
      </ol>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/admin/liste" className="flex-1">
          <AuthButton type="button" className="w-full">
            Alışveriş listesi →
          </AuthButton>
        </Link>
        <Link href="/admin/hazir-listeler" className="flex-1">
          <AuthButton type="button" variant="secondary" className="w-full">
            Hazır listeler
          </AuthButton>
        </Link>
      </div>
    </div>
  );
}
