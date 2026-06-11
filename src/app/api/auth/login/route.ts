import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, toSessionUser } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { createServerClient } from '@/lib/supabase/server';

type LoginMode = 'admin' | 'tent';

function redirectForRole(role: string): string {
  return role === 'admin' ? '/admin' : '/items';
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, campaign_id, mode = 'tent' } = await request.json();
    const loginMode = mode as LoginMode;

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli' }, { status: 400 });
    }

    const supabase = createServerClient();

    if (loginMode === 'tent') {
      if (!campaign_id) {
        return NextResponse.json({ error: 'Kamp kodu gerekli' }, { status: 400 });
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('campaign_id', campaign_id)
        .eq('role', 'user')
        .maybeSingle();

      if (error || !user) {
        return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 401 });
      }

      const valid = await verifyPassword(password, user.password_hash);
      if (!valid) {
        return NextResponse.json({ error: 'Şifre hatalı' }, { status: 401 });
      }

      const session = await getSession();
      session.user = toSessionUser(user);
      session.isLoggedIn = true;
      await session.save();

      const { password_hash: _, ...safeUser } = user;
      return NextResponse.json({
        user: safeUser,
        redirectTo: redirectForRole(user.role),
      });
    }

    // Admin login
    const { data: admins, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('role', 'admin');

    if (error || !admins?.length) {
      return NextResponse.json({ error: 'Admin bulunamadı' }, { status: 401 });
    }

    if (admins.length > 1 && !campaign_id) {
      return NextResponse.json(
        { error: 'Birden fazla admin hesabı var; kamp kodu gerekli' },
        { status: 400 }
      );
    }

    const user = campaign_id
      ? admins.find((a) => a.campaign_id === campaign_id) || null
      : admins[0];

    if (!user) {
      return NextResponse.json({ error: 'Admin bulunamadı' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Şifre hatalı' }, { status: 401 });
    }

    const session = await getSession();
    session.user = toSessionUser(user);
    session.isLoggedIn = true;
    await session.save();

    const { password_hash: _, ...safeUser } = user;
    return NextResponse.json({
      user: safeUser,
      redirectTo: redirectForRole(user.role),
    });
  } catch {
    return NextResponse.json({ error: 'Giriş başarısız' }, { status: 500 });
  }
}
