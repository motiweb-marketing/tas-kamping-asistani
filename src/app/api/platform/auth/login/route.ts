import { NextRequest, NextResponse } from 'next/server';
import {
  isPlatformAdminConfigured,
  verifyPlatformCredentials,
} from '@/lib/platform-auth';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  if (!isPlatformAdminConfigured()) {
    return NextResponse.json(
      { error: 'Platform yönetimi yapılandırılmamış (PLATFORM_ADMIN_* env)' },
      { status: 503 }
    );
  }

  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli' }, { status: 400 });
  }

  if (!verifyPlatformCredentials(String(username), String(password))) {
    return NextResponse.json({ error: 'Geçersiz platform girişi' }, { status: 401 });
  }

  const session = await getSession();
  session.platformAdmin = true;
  session.user = undefined;
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({ ok: true, redirectTo: '/platform' });
}
