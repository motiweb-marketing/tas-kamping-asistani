import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';
import { LIST_TYPES } from '@/lib/list-config';

export default function Step5ListeGuide() {
  return (
    <div className="space-y-4">
      <ol className="list-decimal space-y-2 pl-5 text-sm text-forest-700">
        <li>Menüyü belirleyin</li>
        <li>Kamp ihtiyaçlarını AI ile veya elle oluşturun</li>
        <li>Kişisel ve çadır listelerini düzenleyin</li>
        <li>Kamp listesini kontrol edip yayınlayın</li>
      </ol>
      <Link href="/admin/listeler">
        <AuthButton type="button" className="w-full sm:w-auto">
          Listeler sayfasına git →
        </AuthButton>
      </Link>
      <ul className="space-y-2 text-sm text-forest-600">
        {LIST_TYPES.map((l) => (
          <li key={l.slug}>
            <Link href={l.href} className="font-semibold text-forest-800 underline">
              {l.order}. {l.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
