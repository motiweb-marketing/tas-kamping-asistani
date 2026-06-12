import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';

export default function Step5ListeGuide() {
  return (
    <div className="space-y-5">
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
